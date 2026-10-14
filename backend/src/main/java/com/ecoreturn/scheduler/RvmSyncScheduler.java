package com.ecoreturn.scheduler;

import com.ecoreturn.client.ReturnApiClient;
import com.ecoreturn.dto.RvmImportDto;
import com.ecoreturn.dto.RvmSyncResult;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.service.DistributedLockService;
import com.ecoreturn.service.RvmGeoService;
import com.ecoreturn.service.RvmImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RvmSyncScheduler {

    private static final String LOCK_KEY = "rvm-sync-lock";
    private static final Duration LOCK_TTL = Duration.ofMinutes(10);

    private final ReturnApiClient returnApiClient;
    private final RvmImportService rvmImportService;
    private final DistributedLockService distributedLockService;
    private final RvmGeoService geoService;
    private final RvmMapper rvmMapper;

    @Scheduled(cron = "0 0 3 * * *") // Daily at 3:00 AM
    public void syncRvmData() {
        if (!distributedLockService.tryLock(LOCK_KEY, LOCK_TTL)) {
            log.debug("RVM sync already running, skipping");
            return;
        }

        try {
            log.info("Starting daily RVM sync from Re-turn API...");

            List<RvmImportDto> rvms = returnApiClient.fetchAllRvms();
            if (rvms.isEmpty()) {
                log.warn("No RVM data fetched from API, skipping sync");
                return;
            }

            RvmSyncResult result = rvmImportService.importFromList(rvms);
            log.info("RVM sync completed: {}/{} upserted, {} new, {} removed from API",
                    result.getUpserted(), result.getFetched(),
                    result.getNewCount(), result.getRemovedCount());

            refreshCache();
        } catch (Exception e) {
            log.error("RVM sync failed: {}", e.getMessage(), e);
        } finally {
            distributedLockService.unlock(LOCK_KEY);
        }
    }

    private void refreshCache() {
        try {
            List<Rvm> allRvms = rvmMapper.selectList(null);
            geoService.atomicRefreshCache(allRvms);
            log.info("Redis cache refreshed with {} RVMs", allRvms.size());
        } catch (Exception e) {
            log.error("Cache refresh after sync failed: {}", e.getMessage());
        }
    }
}
