package com.ecoreturn.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.ecoreturn.dto.AuthResponse;
import com.ecoreturn.entity.KarmaLog;
import com.ecoreturn.entity.RefreshToken;
import com.ecoreturn.entity.Report;
import com.ecoreturn.entity.User;
import com.ecoreturn.enums.AuthProvider;
import com.ecoreturn.exception.BadRequestException;
import com.ecoreturn.exception.UnauthorizedException;
import com.ecoreturn.mapper.KarmaLogMapper;
import com.ecoreturn.mapper.RefreshTokenMapper;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            Pattern.CASE_INSENSITIVE
    );

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtService jwtService;
    private final FirebaseAuthService firebaseAuthService;
    private final ReportMapper reportMapper;
    private final KarmaLogMapper karmaLogMapper;

    @Transactional
    public AuthResponse guestLogin(String deviceId) {
        // Validate UUID format
        if (deviceId == null || !UUID_PATTERN.matcher(deviceId).matches()) {
            throw new BadRequestException("Invalid device ID format");
        }

        // Find or create guest user
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getProvider, AuthProvider.GUEST)
                        .eq(User::getProviderId, deviceId)
        );

        if (user == null) {
            user = new User();
            user.setProvider(AuthProvider.GUEST);
            user.setProviderId(deviceId);
            user.setLastActiveAt(LocalDateTime.now());
            userMapper.insert(user);
        } else {
            user.setLastActiveAt(LocalDateTime.now());
            userMapper.updateById(user);
        }

        return generateAuthResponse(user);
    }

    // noRollbackFor keeps the revocation below when the reused token is rejected
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public AuthResponse refresh(String refreshToken) {
        Long userId = jwtService.validateAndGetUserId(refreshToken);
        if (userId == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenHash = hashToken(refreshToken);
        RefreshToken stored = refreshTokenMapper.selectOne(
                new LambdaQueryWrapper<RefreshToken>()
                        .eq(RefreshToken::getTokenHash, tokenHash)
        );

        if (stored == null) {
            // The token is correctly signed and unexpired, so its row existed and was deleted
            // when the token was rotated or revoked. Seeing it again means a copy may be in use:
            // end every session of this user so both holders have to sign in again.
            refreshTokenMapper.delete(
                    new LambdaQueryWrapper<RefreshToken>()
                            .eq(RefreshToken::getUserId, userId)
            );
            throw new UnauthorizedException("Refresh token reuse detected. Please log in again.");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = userMapper.selectById(userId);
        if (user == null || user.getDeletedAt() != null) {
            throw new UnauthorizedException("User not found or deleted");
        }

        // Delete old refresh token
        refreshTokenMapper.deleteById(stored.getId());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse firebaseLogin(String firebaseToken, String currentDeviceId) {
        // 1. Verify Firebase token
        FirebaseAuthService.FirebaseUser fbUser = firebaseAuthService.verifyToken(firebaseToken);
        if (fbUser == null) {
            throw new UnauthorizedException("Invalid Firebase token");
        }

        // 2. Determine provider
        AuthProvider provider = switch (fbUser.provider()) {
            case "google.com" -> AuthProvider.GOOGLE;
            case "apple.com" -> AuthProvider.APPLE;
            default -> throw new BadRequestException("Unsupported auth provider: " + fbUser.provider());
        };

        // 3. Find existing user by provider
        User existingUser = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getProvider, provider)
                        .eq(User::getProviderId, fbUser.uid())
        );

        // 4. Find guest user to merge (if any)
        User guestUser = null;
        if (currentDeviceId != null && UUID_PATTERN.matcher(currentDeviceId).matches()) {
            guestUser = userMapper.selectOne(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getProvider, AuthProvider.GUEST)
                            .eq(User::getProviderId, currentDeviceId)
            );
        }

        AuthResponse.MergeInfo mergeInfo = null;

        if (existingUser != null) {
            // Case: Returning user (possibly on new device)
            if (guestUser != null && guestUser.getKarmaPoints() > 0) {
                // Merge guest karma into existing user
                mergeInfo = mergeGuestIntoUser(guestUser, existingUser);
            }
            existingUser.setLastActiveAt(LocalDateTime.now());
            userMapper.updateById(existingUser);

            AuthResponse response = generateAuthResponse(existingUser);
            response.setMerged(mergeInfo);
            return response;
        } else {
            // Case: New social login user
            User newUser;
            if (guestUser != null) {
                // Upgrade guest to social user
                guestUser.setProvider(provider);
                guestUser.setProviderId(fbUser.uid());
                guestUser.setEmail(fbUser.email());
                guestUser.setDisplayName(fbUser.displayName());
                guestUser.setAvatarUrl(fbUser.photoUrl());
                guestUser.setLastActiveAt(LocalDateTime.now());
                userMapper.updateById(guestUser);
                newUser = guestUser;
            } else {
                // Create new user
                newUser = new User();
                newUser.setProvider(provider);
                newUser.setProviderId(fbUser.uid());
                newUser.setEmail(fbUser.email());
                newUser.setDisplayName(fbUser.displayName());
                newUser.setAvatarUrl(fbUser.photoUrl());
                newUser.setLastActiveAt(LocalDateTime.now());
                userMapper.insert(newUser);
            }
            return generateAuthResponse(newUser);
        }
    }

    private AuthResponse.MergeInfo mergeGuestIntoUser(User guest, User target) {
        int pointsMerged = guest.getKarmaPoints();

        // Transfer karma
        target.setKarmaPoints(target.getKarmaPoints() + pointsMerged);
        target.setReportCount(target.getReportCount() + guest.getReportCount());
        target.setFirstReportCount(target.getFirstReportCount() + guest.getFirstReportCount());
        target.setCorrectionCount(target.getCorrectionCount() + guest.getCorrectionCount());

        // Transfer reports (update user_id)
        reportMapper.update(null,
                new LambdaUpdateWrapper<Report>()
                        .eq(Report::getUserId, guest.getId())
                        .set(Report::getUserId, target.getId())
        );

        // Transfer karma logs
        karmaLogMapper.update(null,
                new LambdaUpdateWrapper<KarmaLog>()
                        .eq(KarmaLog::getUserId, guest.getId())
                        .set(KarmaLog::getUserId, target.getId())
        );

        // Delete guest's refresh tokens before deleting guest account
        refreshTokenMapper.delete(
                new LambdaQueryWrapper<RefreshToken>()
                        .eq(RefreshToken::getUserId, guest.getId())
        );

        // Delete guest account
        String guestId = guest.getId().toString();
        userMapper.deleteById(guest.getId());

        return AuthResponse.MergeInfo.builder()
                .fromGuestId(guestId)
                .pointsMerged(pointsMerged)
                .build();
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        // Store refresh token hash
        RefreshToken rt = new RefreshToken();
        rt.setUserId(user.getId());
        rt.setTokenHash(hashToken(refreshToken));
        rt.setExpiresAt(LocalDateTime.now().plusSeconds(
                jwtService.getRefreshTokenExpiryMs() / 1000));
        refreshTokenMapper.insert(rt);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.fromEntity(user))
                .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}