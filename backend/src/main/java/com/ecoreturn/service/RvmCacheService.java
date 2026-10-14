package com.ecoreturn.service;

import com.ecoreturn.dto.RvmDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RvmCacheService {

    private static final String ALL_RVMS_KEY = "rvm:all";
    private static final long ALL_RVMS_TTL_HOURS = 24;

    private final ValueOperations<String, String> valueOperations;
    private final ObjectMapper objectMapper;

    @Autowired
    public RvmCacheService(StringRedisTemplate redisTemplate,
                           @Qualifier("redisObjectMapper") ObjectMapper objectMapper) {
        this.valueOperations = redisTemplate.opsForValue();
        this.objectMapper = objectMapper;
    }

    // Constructor for testing
    RvmCacheService(ValueOperations<String, String> valueOperations, ObjectMapper objectMapper) {
        this.valueOperations = valueOperations;
        this.objectMapper = objectMapper;
    }

    public List<RvmDto> getAllRvms() {
        try {
            String cached = valueOperations.get(ALL_RVMS_KEY);
            if (cached != null) {
                List<RvmDto> result = objectMapper.readValue(cached, new TypeReference<>() {});
                log.info("Cache HIT: returned {} RVMs from Redis", result.size());
                return result;
            }
            log.info("Cache MISS: no data in Redis for key {}", ALL_RVMS_KEY);
        } catch (Exception e) {
            log.warn("Failed to read RVMs from cache", e);
        }
        return Collections.emptyList();
    }

    public void cacheAllRvms(List<RvmDto> rvms) {
        try {
            String json = objectMapper.writeValueAsString(rvms);
            valueOperations.set(ALL_RVMS_KEY, json, ALL_RVMS_TTL_HOURS, TimeUnit.HOURS);
            log.info("Cached {} RVMs to Redis with TTL {} hours", rvms.size(), ALL_RVMS_TTL_HOURS);
        } catch (Exception e) {
            log.error("Failed to cache RVMs", e);
        }
    }

    public void invalidateAllRvms() {
        valueOperations.getOperations().delete(ALL_RVMS_KEY);
    }
}
