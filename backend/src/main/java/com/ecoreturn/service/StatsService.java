package com.ecoreturn.service;

import com.ecoreturn.dto.DashboardStatsDto;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.RvmMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Service for dashboard statistics.
 * Provides cached metrics for the web landing page.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private static final String CACHE_KEY = "dashboard:stats";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final List<String> ACTIVE_STATUSES = List.of("AVAILABLE", "BUSY");

    private final StringRedisTemplate redisTemplate;
    private final ReportMapper reportMapper;
    private final RvmMapper rvmMapper;
    private final ObjectMapper objectMapper;

    /**
     * Gets dashboard statistics with Redis caching.
     * Cache TTL is 10 minutes to reduce database load.
     *
     * @return DashboardStatsDto with today's reports, active rate, and top contributor
     */
    public DashboardStatsDto getDashboardStats() {
        // 1. Try to get from Redis cache
        String cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, DashboardStatsDto.class);
            } catch (Exception e) {
                log.warn("Failed to parse cached dashboard stats", e);
            }
        }

        // 2. Cache miss - query database
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        int todayReports = reportMapper.countReportsAfter(startOfDay);

        long totalRvms = rvmMapper.selectCount(null);
        long activeRvms = rvmMapper.countByStatusIn(ACTIVE_STATUSES);
        double activeRate = totalRvms > 0
            ? Math.round((double) activeRvms / totalRvms * 100) / 100.0
            : 0.0;

        // 3. Build response (Top Contributor is placeholder for now)
        DashboardStatsDto stats = new DashboardStatsDto(
            todayReports,
            activeRate,
            "Community_Hero",  // Placeholder until user system is implemented
            Instant.now()
        );

        // 4. Store in Redis cache
        try {
            String json = objectMapper.writeValueAsString(stats);
            redisTemplate.opsForValue().set(CACHE_KEY, json, CACHE_TTL);
            log.debug("Cached dashboard stats: {}", stats);
        } catch (Exception e) {
            log.warn("Failed to cache dashboard stats", e);
        }

        return stats;
    }
}
