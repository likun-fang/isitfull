package com.ecoreturn.runner;

import com.ecoreturn.entity.Rvm;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.service.RvmGeoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Warms up the Redis GEO cache on application startup.
 * Loads all RVM data from PostgreSQL into Redis for fast nearby queries.
 */
@Slf4j
@Component
@Order(100) // Run after DataImportRunner
@RequiredArgsConstructor
public class CacheWarmupRunner implements CommandLineRunner {

    private final RvmMapper rvmMapper;
    private final RvmGeoService geoService;

    @Override
    public void run(String... args) {
        log.info("Starting Redis GEO cache warmup...");

        try {
            // Check if cache is already populated
            if (geoService.isCachePopulated()) {
                log.info("Redis GEO cache already populated, skipping warmup");
                return;
            }

            // Load all RVMs from PostgreSQL
            List<Rvm> rvms = rvmMapper.selectList(null);

            if (rvms.isEmpty()) {
                log.warn("No RVMs found in database, cache warmup skipped");
                return;
            }

            // Populate Redis GEO cache
            geoService.addAllRvms(rvms);

            log.info("Redis GEO cache warmup completed: {} RVMs loaded", rvms.size());
        } catch (Exception e) {
            log.error("Redis GEO cache warmup failed: {}", e.getMessage(), e);
            // Don't throw - allow application to start even if cache warmup fails
        }
    }
}
