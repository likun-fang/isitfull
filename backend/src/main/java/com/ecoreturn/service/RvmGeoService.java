package com.ecoreturn.service;

import com.ecoreturn.dto.RvmDto;
import com.ecoreturn.dto.RvmStatusResult;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class RvmGeoService {

    private static final String GEO_KEY = "rvm:geo";
    private static final String DATA_KEY = "rvm:data";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RvmGeoService(StringRedisTemplate redisTemplate,
                         @Qualifier("redisObjectMapper") ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Add a single RVM to the geo index and data hash.
     */
    public void addRvm(Rvm rvm) {
        try {
            // Add to GEO index
            redisTemplate.opsForGeo().add(GEO_KEY,
                    new Point(rvm.getLongitude(), rvm.getLatitude()),
                    rvm.getId().toString());

            // Add to data hash
            RvmDto dto = RvmDto.fromEntity(rvm, null);
            String json = objectMapper.writeValueAsString(dto);
            redisTemplate.opsForHash().put(DATA_KEY, rvm.getId().toString(), json);
        } catch (Exception e) {
            log.warn("Failed to add RVM {} to Redis: {}", rvm.getId(), e.getMessage());
        }
    }

    /**
     * Bulk add RVMs to Redis (used for cache warmup).
     * Uses Redis Pipeline for GEO ADD to minimize network round-trips.
     */
    public void addAllRvms(List<Rvm> rvms) {
        List<Rvm> activeRvms = rvms.stream()
                .filter(rvm -> rvm.getStatus() != RvmStatus.REMOVED)
                .toList();

        if (activeRvms.isEmpty()) {
            return;
        }

        try {
            // Phase 1: Pipeline GEO ADD (replaces individual calls)
            redisTemplate.executePipelined((org.springframework.data.redis.core.RedisCallback<Object>) connection -> {
                byte[] geoKeyBytes = GEO_KEY.getBytes();
                for (Rvm rvm : activeRvms) {
                    connection.geoCommands().geoAdd(geoKeyBytes,
                        new Point(rvm.getLongitude(), rvm.getLatitude()),
                        rvm.getId().toString().getBytes());
                }
                return null;
            });

            // Phase 2: Batch HASH putAll (already batched, no change needed)
            Map<String, String> dataMap = new HashMap<>();
            for (Rvm rvm : activeRvms) {
                RvmDto dto = RvmDto.fromEntity(rvm, null);
                dataMap.put(rvm.getId().toString(), objectMapper.writeValueAsString(dto));
            }
            redisTemplate.opsForHash().putAll(DATA_KEY, dataMap);

            log.info("Loaded {} RVMs into Redis GEO cache ({} REMOVED skipped)",
                    activeRvms.size(), rvms.size() - activeRvms.size());
        } catch (Exception e) {
            log.error("Failed to bulk add RVMs to Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Remove an RVM from the geo index and data hash.
     */
    public void removeRvm(Long rvmId) {
        try {
            redisTemplate.opsForGeo().remove(GEO_KEY, rvmId.toString());
            redisTemplate.opsForHash().delete(DATA_KEY, rvmId.toString());
            log.info("Removed RVM {} from Redis GEO cache", rvmId);
        } catch (Exception e) {
            log.warn("Failed to remove RVM {} from Redis: {}", rvmId, e.getMessage());
        }
    }

    /**
     * Find nearby RVMs using Redis GEO.
     *
     * @return List of RvmDto with distance, or empty list if cache miss
     */
    public List<RvmDto> findNearby(double lat, double lng, int radiusMeters, int limit) {
        try {
            // Query Redis GEO
            Circle circle = new Circle(new Point(lng, lat),
                    new Distance(radiusMeters, Metrics.NEUTRAL));

            RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                    .newGeoRadiusArgs()
                    .includeDistance()
                    .sortAscending()
                    .limit(limit);

            GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                    redisTemplate.opsForGeo().radius(GEO_KEY, circle, args);

            if (results == null || results.getContent().isEmpty()) {
                log.debug("Redis GEO returned no results for ({}, {}) radius {}m",
                        lat, lng, radiusMeters);
                return Collections.emptyList();
            }

            // Extract IDs and distances
            List<String> ids = new ArrayList<>();
            Map<String, Integer> distanceMap = new HashMap<>();

            for (GeoResult<RedisGeoCommands.GeoLocation<String>> result : results) {
                String id = result.getContent().getName();
                int distance = (int) Math.round(result.getDistance().getValue());
                ids.add(id);
                distanceMap.put(id, distance);
            }

            // Batch fetch RVM data from Hash
            List<Object> dataList = redisTemplate.opsForHash().multiGet(DATA_KEY, new ArrayList<>(ids));

            List<RvmDto> rvmDtos = new ArrayList<>();
            for (int i = 0; i < ids.size(); i++) {
                Object data = dataList.get(i);
                if (data != null) {
                    RvmDto dto = objectMapper.readValue(data.toString(), RvmDto.class);
                    dto.setDistanceMeters(distanceMap.get(ids.get(i)));
                    rvmDtos.add(dto);
                }
            }

            log.info("Redis GEO HIT: returned {} RVMs near ({}, {}) within {}m",
                    rvmDtos.size(), lat, lng, radiusMeters);
            return rvmDtos;

        } catch (Exception e) {
            log.warn("Redis GEO query failed, will fallback to PostGIS: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Update RVM status in Redis Hash.
     */
    public void updateStatus(Long rvmId, RvmStatus status, BigDecimal confidence, QueueLength queueLength, LocalDateTime updatedAt) {
        try {
            Object existing = redisTemplate.opsForHash().get(DATA_KEY, rvmId.toString());
            if (existing != null) {
                RvmDto dto = objectMapper.readValue(existing.toString(), RvmDto.class);
                dto.setStatus(status);
                dto.setConfidenceScore(confidence);
                dto.setQueueLength(queueLength);
                dto.setStatusUpdatedAt(updatedAt);
                String json = objectMapper.writeValueAsString(dto);
                redisTemplate.opsForHash().put(DATA_KEY, rvmId.toString(), json);
            }
        } catch (Exception e) {
            log.warn("Failed to update RVM {} status in Redis: {}", rvmId, e.getMessage());
        }
    }

    /**
     * Check if the GEO cache is populated.
     */
    public boolean isCachePopulated() {
        Long size = redisTemplate.opsForZSet().size(GEO_KEY);
        return size != null && size > 0;
    }

    /**
     * Clear all RVM cache data.
     */
    public void clearCache() {
        redisTemplate.delete(GEO_KEY);
        redisTemplate.delete(DATA_KEY);
        log.info("Cleared Redis GEO cache");
    }

    /**
     * Atomically refresh the cache using staging keys.
     * Writes to staging keys first, then RENAMEs to replace active keys.
     * Eliminates the empty window between clearCache() + addAllRvms().
     */
    public void atomicRefreshCache(List<Rvm> rvms) {
        String stagingGeoKey = GEO_KEY + ":staging";
        String stagingDataKey = DATA_KEY + ":staging";

        List<Rvm> activeRvms = rvms.stream()
            .filter(rvm -> rvm.getStatus() != RvmStatus.REMOVED)
            .toList();

        try {
            // Clean up any leftover staging keys
            redisTemplate.delete(stagingGeoKey);
            redisTemplate.delete(stagingDataKey);

            // Write to staging keys
            redisTemplate.executePipelined((org.springframework.data.redis.core.RedisCallback<Object>) connection -> {
                byte[] geoKeyBytes = stagingGeoKey.getBytes();
                for (Rvm rvm : activeRvms) {
                    connection.geoCommands().geoAdd(geoKeyBytes,
                        new Point(rvm.getLongitude(), rvm.getLatitude()),
                        rvm.getId().toString().getBytes());
                }
                return null;
            });

            Map<String, String> dataMap = new HashMap<>();
            for (Rvm rvm : activeRvms) {
                RvmDto dto = RvmDto.fromEntity(rvm, null);
                dataMap.put(rvm.getId().toString(), objectMapper.writeValueAsString(dto));
            }
            redisTemplate.opsForHash().putAll(stagingDataKey, dataMap);

            // Atomic switch (RENAME is O(1))
            redisTemplate.rename(stagingGeoKey, GEO_KEY);
            redisTemplate.rename(stagingDataKey, DATA_KEY);

            log.info("Atomic cache refresh: {} RVMs loaded", activeRvms.size());
        } catch (Exception e) {
            // Clean up staging keys on failure
            redisTemplate.delete(stagingGeoKey);
            redisTemplate.delete(stagingDataKey);
            log.error("Atomic cache refresh failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Batch update RVM statuses in Redis Hash.
     * Uses multiGet + putAll instead of individual read-modify-write cycles.
     */
    public void batchUpdateStatus(Map<Long, RvmStatusResult> updates) {
        if (updates.isEmpty()) return;

        try {
            // Phase 1: Batch read existing data
            List<Object> fields = updates.keySet().stream()
                .map(id -> (Object) id.toString())
                .toList();
            List<Object> existingData = redisTemplate.opsForHash().multiGet(DATA_KEY, fields);

            // Phase 2: Build update map
            Map<String, String> updateMap = new HashMap<>();
            List<Object> fieldList = new ArrayList<>(fields);
            for (int i = 0; i < fieldList.size(); i++) {
                Object data = existingData.get(i);
                if (data == null) continue;
                try {
                    String key = fieldList.get(i).toString();
                    Long rvmId = Long.parseLong(key);
                    RvmDto dto = objectMapper.readValue(data.toString(), RvmDto.class);
                    RvmStatusResult r = updates.get(rvmId);
                    dto.setStatus(r.getStatus());
                    dto.setConfidenceScore(r.getConfidence());
                    dto.setQueueLength(r.getQueueLength());
                    dto.setStatusUpdatedAt(r.getLastReportTime());
                    updateMap.put(key, objectMapper.writeValueAsString(dto));
                } catch (Exception e) {
                    log.warn("Failed to prepare Redis update: {}", e.getMessage());
                }
            }

            // Phase 3: Batch write
            if (!updateMap.isEmpty()) {
                redisTemplate.opsForHash().putAll(DATA_KEY, updateMap);
                log.info("Redis batch updated {} RVMs", updateMap.size());
            }
        } catch (Exception e) {
            log.error("Redis batch update failed: {}", e.getMessage(), e);
        }
    }
}