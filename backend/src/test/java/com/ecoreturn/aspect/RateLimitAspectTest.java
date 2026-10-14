package com.ecoreturn.aspect;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.exception.RateLimitException;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RateLimitAspectTest {

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RRateLimiter rateLimiter;

    @Mock
    private JoinPoint joinPoint;

    @Mock
    private MethodSignature signature;

    private RateLimitAspect aspect;
    private RateLimit rateLimit;

    @BeforeEach
    void setUp() throws NoSuchMethodException {
        Method endpoint = SampleController.class.getMethod("limitedEndpoint");
        rateLimit = endpoint.getAnnotation(RateLimit.class);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(endpoint);
        when(redissonClient.getRateLimiter(anyString())).thenReturn(rateLimiter);
        aspect = new RateLimitAspect(redissonClient);
    }

    @Test
    void checkingTheLimit_keepsTheRequestsAlreadyCounted() {
        when(rateLimiter.tryAcquire(1)).thenReturn(true);

        aspect.doBefore(joinPoint, rateLimit);

        // Redisson's setRate also deletes the counted requests, so calling it on every
        // request would mean nothing is ever limited. trySetRate only writes missing config.
        verify(rateLimiter).trySetRate(RateType.OVERALL, 2, 60, RateIntervalUnit.SECONDS);
        verify(rateLimiter, never()).setRate(any(), anyLong(), anyLong(), any());
    }

    @Test
    void exhaustedLimit_rejectsTheRequest() {
        when(rateLimiter.tryAcquire(1)).thenReturn(false);

        assertThatThrownBy(() -> aspect.doBefore(joinPoint, rateLimit))
                .isInstanceOf(RateLimitException.class)
                .hasMessage("Too many requests, please try again later.");
    }

    static class SampleController {
        @RateLimit(rate = 2, rateInterval = 60, limitType = RateLimitType.IP)
        public void limitedEndpoint() {
        }
    }
}
