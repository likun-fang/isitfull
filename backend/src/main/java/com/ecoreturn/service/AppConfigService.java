package com.ecoreturn.service;

import com.ecoreturn.dto.AppConfigDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppConfigService {

    private static final String KEY_MIN_VERSION = "app:min_version";
    private static final String KEY_MAINTENANCE_ENABLED = "app:maintenance:enabled";
    private static final String KEY_MAINTENANCE_MESSAGE = "app:maintenance:message";

    private static final String DEFAULT_MIN_VERSION = "1.0.0";

    private final StringRedisTemplate redisTemplate;

    public AppConfigDto getConfig() {
        try {
            String minVersion = redisTemplate.opsForValue().get(KEY_MIN_VERSION);
            String maintenanceEnabled = redisTemplate.opsForValue().get(KEY_MAINTENANCE_ENABLED);
            String maintenanceMessage = redisTemplate.opsForValue().get(KEY_MAINTENANCE_MESSAGE);

            return new AppConfigDto(
                minVersion != null ? minVersion : DEFAULT_MIN_VERSION,
                "true".equalsIgnoreCase(maintenanceEnabled),
                maintenanceMessage != null ? maintenanceMessage : ""
            );
        } catch (Exception e) {
            log.warn("Failed to read app config from Redis, returning defaults", e);
            return new AppConfigDto(DEFAULT_MIN_VERSION, false, "");
        }
    }
}
