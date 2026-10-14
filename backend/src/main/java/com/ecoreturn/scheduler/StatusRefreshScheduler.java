package com.ecoreturn.scheduler;

import com.ecoreturn.dto.RvmStatusResult;
import com.ecoreturn.dto.RvmStatusSnapshot;
import com.ecoreturn.entity.Report;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.service.DistributedLockService;
import com.ecoreturn.service.RvmGeoService;
import com.ecoreturn.service.StatusCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class StatusRefreshScheduler {

    private static final String LOCK_KEY = "status-refresh-lock";
    private static final Duration LOCK_TTL = Duration.ofMinutes(4);

    /**
     * Batch size for DB updates.
     * 500 rows x 5 fields = 2500 params, well under PostgreSQL's 32767 limit.
     * Do NOT increase without recalculating parameter count.
     */
    private static final int BATCH_SIZE = 500;

    private final RvmMapper rvmMapper;
    private final ReportMapper reportMapper;
    private final StatusCalculationService statusCalculationService;
    private final DistributedLockService distributedLockService;
    private final RvmGeoService geoService;

    @Scheduled(fixedRate = 5 * 60 * 1000) // Every 5 minutes
    public void refreshAllRvmStatus() {
        if (!distributedLockService.tryLock(LOCK_KEY, LOCK_TTL)) {
            log.debug("Status refresh already running, skipping");
            return;
        }

        try {
            LocalDateTime now = LocalDateTime.now(); // Unified timestamp for entire batch
            LocalDateTime cutoff = now.minusHours(24); // MAX_TTL = 24h

            // Step 1: Single query to fetch all reports within the time window
            List<Report> allReports = reportMapper.findAllRecentReports(cutoff);
            if (allReports.size() >= 50000) {
                log.warn("Report count hit defensive limit (50000), results may be incomplete");
            }
            Map<Long, List<Report>> reportsByRvm = allReports.stream()
                .collect(Collectors.groupingBy(Report::getRvmId));

            // Step 2: Fetch current status of all unlocked RVMs
            List<RvmStatusSnapshot> currentStatuses = rvmMapper.findUnlockedStatuses();

            // Step 3: Calculate new status + dirty check
            List<RvmStatusSnapshot> dirtyUpdates = new ArrayList<>();
            Map<Long, RvmStatusResult> dirtyResults = new HashMap<>();

            for (RvmStatusSnapshot current : currentStatuses) {
                List<Report> reports = reportsByRvm.getOrDefault(current.getId(), List.of());
                RvmStatusResult newResult = statusCalculationService
                    .calculateStatusFromReports(reports, now);

                if (current.isDirty(newResult)) {
                    RvmStatusSnapshot update = new RvmStatusSnapshot();
                    update.setId(current.getId());
                    update.setStatus(newResult.getStatus());
                    update.setConfidenceScore(newResult.getConfidence());
                    update.setQueueLength(newResult.getQueueLength());
                    update.setStatusUpdatedAt(newResult.getLastReportTime());
                    dirtyUpdates.add(update);
                    dirtyResults.put(current.getId(), newResult);
                }
            }

            // Step 4: Batch update PostgreSQL (in chunks of BATCH_SIZE)
            if (!dirtyUpdates.isEmpty()) {
                for (int i = 0; i < dirtyUpdates.size(); i += BATCH_SIZE) {
                    List<RvmStatusSnapshot> batch = dirtyUpdates.subList(
                        i, Math.min(i + BATCH_SIZE, dirtyUpdates.size()));
                    rvmMapper.batchUpdateStatus(batch);
                }
            }

            // Step 5: Batch update Redis
            if (!dirtyResults.isEmpty()) {
                try {
                    geoService.batchUpdateStatus(dirtyResults);
                } catch (Exception e) {
                    log.error("Redis batch update failed: {}", e.getMessage());
                }
            }

            log.info("Status refresh: {}/{} RVMs dirty, {} reports in window",
                dirtyUpdates.size(), currentStatuses.size(), allReports.size());
        } finally {
            distributedLockService.unlock(LOCK_KEY);
        }
    }
}
