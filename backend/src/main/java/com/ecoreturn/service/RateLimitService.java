package com.ecoreturn.service;

import com.ecoreturn.exception.RateLimitException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private static final Duration RATE_LIMIT_DURATION = Duration.ofMinutes(15);
    private static final String KEY_PREFIX = "report:";

    private final StringRedisTemplate redisTemplate;

    public void checkRateLimit(Long userId, Long rvmId) {
        String key = KEY_PREFIX + userId + ":" + rvmId;

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            Long ttl = redisTemplate.getExpire(key);
            int retryAfter = ttl != null ? ttl.intValue() : (int) RATE_LIMIT_DURATION.toSeconds();
            throw new RateLimitException(
                "You have already reported this location within 15 minutes.",
                retryAfter
            );
        }
    }

    public void recordReport(Long userId, Long rvmId) {
        String key = KEY_PREFIX + userId + ":" + rvmId;
        redisTemplate.opsForValue().set(key, "1", RATE_LIMIT_DURATION);
    }
}
