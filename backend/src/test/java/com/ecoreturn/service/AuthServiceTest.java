package com.ecoreturn.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.ecoreturn.dto.AuthResponse;
import com.ecoreturn.entity.RefreshToken;
import com.ecoreturn.entity.User;
import com.ecoreturn.enums.AuthProvider;
import com.ecoreturn.exception.UnauthorizedException;
import com.ecoreturn.mapper.KarmaLogMapper;
import com.ecoreturn.mapper.RefreshTokenMapper;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.UserMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final Long USER_ID = 42L;
    private static final long ONE_HOUR_MS = 3_600_000L;
    private static final long THIRTY_DAYS_MS = 2_592_000_000L;

    @Mock
    private UserMapper userMapper;

    @Mock
    private RefreshTokenMapper refreshTokenMapper;

    @Mock
    private ReportMapper reportMapper;

    @Mock
    private KarmaLogMapper karmaLogMapper;

    @Captor
    private ArgumentCaptor<LambdaQueryWrapper<RefreshToken>> deleteCondition;

    // The real JwtService signs and checks tokens without any I/O, so the tests use it as is
    private final JwtService jwtService =
            new JwtService("test-secret-that-is-at-least-32-characters-long", ONE_HOUR_MS, THIRTY_DAYS_MS);

    private AuthService authService;

    @BeforeAll
    static void loadRefreshTokenColumns() {
        // Lets LambdaQueryWrapper turn RefreshToken::getUserId into "user_id" without a database
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), RefreshToken.class);
    }

    @BeforeEach
    void setUp() {
        // Refresh never uses Firebase, so no FirebaseAuthService is needed
        authService = new AuthService(
                userMapper, refreshTokenMapper, jwtService, null, reportMapper, karmaLogMapper);
    }

    @Test
    void reusedRefreshToken_revokesEverySessionOfThatUser() {
        // Correctly signed, but no row matches it because it was already rotated
        String rotatedToken = jwtService.generateRefreshToken(USER_ID);

        assertThatThrownBy(() -> authService.refresh(rotatedToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Refresh token reuse detected. Please log in again.");

        verify(refreshTokenMapper).delete(deleteCondition.capture());
        assertThat(deleteCondition.getValue().getSqlSegment()).contains("user_id =");
        assertThat(deleteCondition.getValue().getParamNameValuePairs()).containsValue(USER_ID);
        verify(refreshTokenMapper, never()).insert(any(RefreshToken.class));
    }

    @Test
    void refresh_keepsTheRevocationWhenItRejectsTheToken() throws NoSuchMethodException {
        Transactional transactional = AuthService.class
                .getMethod("refresh", String.class)
                .getAnnotation(Transactional.class);

        // Rejecting the token throws, and a rollback would undo the revocation above
        assertThat(transactional.noRollbackFor()).contains(UnauthorizedException.class);
    }

    @Test
    void currentRefreshToken_isRotated() {
        String currentToken = jwtService.generateRefreshToken(USER_ID);
        when(refreshTokenMapper.selectOne(any())).thenReturn(storedToken(LocalDateTime.now().plusDays(1)));
        when(userMapper.selectById(USER_ID)).thenReturn(guestUser());

        AuthResponse response = authService.refresh(currentToken);

        assertThat(jwtService.validateAndGetUserId(response.getRefreshToken())).isEqualTo(USER_ID);
        verify(refreshTokenMapper).deleteById(7L);
        verify(refreshTokenMapper).insert(any(RefreshToken.class));
        verify(refreshTokenMapper, never()).delete(any());
    }

    @Test
    void expiredRefreshToken_isRejectedWithoutRevokingOtherSessions() {
        String expiredToken = jwtService.generateRefreshToken(USER_ID);
        when(refreshTokenMapper.selectOne(any())).thenReturn(storedToken(LocalDateTime.now().minusMinutes(1)));

        assertThatThrownBy(() -> authService.refresh(expiredToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Refresh token expired or revoked");

        verify(refreshTokenMapper, never()).delete(any());
    }

    private RefreshToken storedToken(LocalDateTime expiresAt) {
        RefreshToken token = new RefreshToken();
        token.setId(7L);
        token.setUserId(USER_ID);
        token.setExpiresAt(expiresAt);
        return token;
    }

    private User guestUser() {
        User user = new User();
        user.setId(USER_ID);
        user.setProvider(AuthProvider.GUEST);
        return user;
    }
}
