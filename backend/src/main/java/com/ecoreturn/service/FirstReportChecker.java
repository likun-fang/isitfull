package com.ecoreturn.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class FirstReportChecker {

    private static final String KEY_PREFIX = "rvm:last_report:";
    private static final Duration FIRST_REPORT_WINDOW = Duration.ofHours(24);

    private final StringRedisTemplate redis;

    public boolean isFirstReport(Long rvmId) {
        String key = KEY_PREFIX + rvmId;
        String lastReport = redis.opsForValue().get(key);

        if (lastReport == null) {
            return true; // Never reported
        }

        try {
            Instant lastTime = Instant.parse(lastReport);
            return Instant.now().isAfter(lastTime.plus(FIRST_REPORT_WINDOW));
        } catch (Exception e) {
            return true; // Invalid data, treat as first report
        }
    }

    public void recordReport(Long rvmId) {
        String key = KEY_PREFIX + rvmId;
        redis.opsForValue().set(key, Instant.now().toString(), FIRST_REPORT_WINDOW);
    }
}
