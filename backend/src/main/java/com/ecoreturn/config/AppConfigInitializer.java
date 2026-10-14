package com.ecoreturn.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AppConfigInitializer implements ApplicationRunner {

    private static final String KEY_MIN_VERSION = "app:min_version";
    private static final String KEY_MAINTENANCE_ENABLED = "app:maintenance:enabled";
    private static final String KEY_MAINTENANCE_MESSAGE = "app:maintenance:message";

    private final StringRedisTemplate redisTemplate;

    public AppConfigInitializer(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            setIfAbsent(KEY_MIN_VERSION, "1.0.0");
            setIfAbsent(KEY_MAINTENANCE_ENABLED, "false");
            setIfAbsent(KEY_MAINTENANCE_MESSAGE, "");
            log.info("App config Redis keys initialized");
        } catch (Exception e) {
            log.warn("Failed to initialize app config Redis keys", e);
        }
    }

    private void setIfAbsent(String key, String value) {
        redisTemplate.opsForValue().setIfAbsent(key, value);
    }
}
