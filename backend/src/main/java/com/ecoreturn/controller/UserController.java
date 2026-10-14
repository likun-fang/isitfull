package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.annotation.RequireAuth;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.AuthResponse;
import com.ecoreturn.dto.KarmaLogDto;
import com.ecoreturn.dto.UpdateDisplayNameRequest;
import com.ecoreturn.entity.User;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.enums.UserRank;
import com.ecoreturn.mapper.KarmaLogMapper;
import com.ecoreturn.service.DisplayNameValidator;
import com.ecoreturn.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final KarmaLogMapper karmaLogMapper;
    private final DisplayNameValidator displayNameValidator;

    @GetMapping("/me")
    @RequireAuth
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getMe() {
        User user = UserContext.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                AuthResponse.UserDto.fromEntity(user)
        ));
    }

    @PatchMapping("/me/display-name")
    @RequireAuth
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateDisplayName(
            @Valid @RequestBody UpdateDisplayNameRequest request) {
        Long userId = UserContext.getCurrentUserId();

        var validation = displayNameValidator.validate(request.getDisplayName());
        if (!validation.valid()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALIDATION_ERROR", validation.message()));
        }

        User user = userService.updateDisplayName(userId, validation.sanitized());
        return ResponseEntity.ok(ApiResponse.success(
                AuthResponse.UserDto.fromEntity(user)
        ));
    }

    @DeleteMapping("/me")
    @RequireAuth
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        Long userId = UserContext.getCurrentUserId();
        userService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/me/karma-logs")
    @RequireAuth
    public ResponseEntity<ApiResponse<List<KarmaLogDto>>> getKarmaLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = UserContext.getCurrentUserId();
        List<KarmaLogDto> logs = karmaLogMapper.findByUserIdWithRvmName(
                userId, size, page * size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/top-contributors")
    @RateLimit(rate = 120, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<List<TopContributorDto>>> getTopContributors(
            @RequestParam(defaultValue = "5") int limit) {
        if (limit > 20) limit = 20;
        List<User> users = userService.getTopContributors(limit);
        List<TopContributorDto> dtos = users.stream()
                .map(TopContributorDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    public record TopContributorDto(
            String id,
            String displayName,
            String avatarUrl,
            int karmaPoints,
            UserRank rank
    ) {
        public static TopContributorDto fromEntity(User user) {
            return new TopContributorDto(
                    user.getId().toString(),
                    user.getDisplayName(),
                    user.getAvatarUrl(),
                    user.getKarmaPoints(),
                    UserRank.fromKarma(user.getKarmaPoints())
            );
        }
    }
}
