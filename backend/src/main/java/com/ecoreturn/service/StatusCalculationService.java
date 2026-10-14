package com.ecoreturn.service;

import com.ecoreturn.dto.RvmStatusResult;
import com.ecoreturn.entity.Report;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * State-specific Decay Strategy for RVM status calculation.
 *
 * Different statuses have different physical characteristics:
 * - AVAILABLE: Stable state - machines don't break often (24h TTL)
 * - BROKEN: Long-tail state - repairs take time (12h TTL)
 * - BUSY: Transient state - gets cleared quickly by staff (3h TTL)
 *
 * Design principles:
 * 1. BUSY expires -> likely AVAILABLE (staff cleared it)
 * 2. Tie-breaking favors BROKEN (better safe than sorry)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatusCalculationService {

    // State-specific TTLs based on physical characteristics
    private static final Duration TTL_AVAILABLE = Duration.ofHours(24);  // Stable: machines stay working
    private static final Duration TTL_BROKEN = Duration.ofHours(12);     // Long-tail: repairs take time
    private static final Duration TTL_BUSY = Duration.ofHours(3);        // Transient: cleared quickly

    // Use the longest TTL to fetch all potentially relevant reports
    private static final Duration MAX_TTL = TTL_AVAILABLE;

    // Low confidence threshold for expired BUSY -> AVAILABLE inference
    private static final BigDecimal LOW_CONFIDENCE = new BigDecimal("30.00");

    // Default confidence for RVMs with no reports (cold-start: assume AVAILABLE)
    private static final BigDecimal COLD_START_CONFIDENCE = new BigDecimal("20.00");

    // Status priority for tie-breaking (higher = wins ties)
    // BROKEN wins ties because: better to warn users than send them to broken machine
    private static final Map<RvmStatus, Integer> STATUS_PRIORITY = Map.of(
        RvmStatus.BROKEN, 3,     // Highest - safety first
        RvmStatus.BUSY, 2,       // Medium
        RvmStatus.AVAILABLE, 1,  // Lower
        RvmStatus.UNKNOWN, 0     // Lowest
    );

    private final ReportMapper reportMapper;

    public RvmStatusResult calculateStatus(Long rvmId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minus(MAX_TTL);
        List<Report> allReports = reportMapper.findRecentReports(rvmId, cutoff);
        return calculateStatusFromReports(allReports, now);
    }

    /**
     * Pure computation method: calculates RVM status from pre-fetched reports.
     * Enables batch processing by separating DB access from status logic.
     *
     * @param reports  pre-fetched reports for a single RVM (may be null or empty)
     * @param now      unified timestamp for consistent TTL calculations
     * @return computed status result
     */
    public RvmStatusResult calculateStatusFromReports(List<Report> reports, LocalDateTime now) {
        if (reports == null || reports.isEmpty()) {
            return new RvmStatusResult(RvmStatus.AVAILABLE, COLD_START_CONFIDENCE, null, null);
        }

        // Get the time of the most recent report
        LocalDateTime lastReportTime = reports.stream()
            .map(Report::getCreatedAt)
            .filter(Objects::nonNull)
            .max(LocalDateTime::compareTo)
            .orElse(null);

        // Check for expired BUSY reports (special case: BUSY expires -> likely AVAILABLE)
        RvmStatusResult expiredBusyResult = handleExpiredBusyReports(reports, now, lastReportTime);
        if (expiredBusyResult != null) {
            return expiredBusyResult;
        }

        // Filter reports based on state-specific TTL
        Map<RvmStatus, Double> statusScores = new EnumMap<>(RvmStatus.class);
        double totalWeight = 0;
        int validReportCount = 0;

        for (Report report : reports) {
            // Check if this report is still valid based on its status-specific TTL
            if (!isReportValid(report, now)) {
                continue;
            }

            double weight = calculateWeight(report, now);
            totalWeight += weight;
            statusScores.merge(report.getStatus(), weight, Double::sum);
            validReportCount++;
        }

        // If no valid reports after filtering, return UNKNOWN
        if (totalWeight == 0) {
            return new RvmStatusResult(RvmStatus.UNKNOWN, BigDecimal.ZERO, null, lastReportTime);
        }

        // Find winning status with tie-breaking (BROKEN wins ties)
        RvmStatus winningStatus = statusScores.entrySet().stream()
            .max(Comparator
                .comparingDouble((Map.Entry<RvmStatus, Double> e) -> e.getValue())
                .thenComparingInt(e -> STATUS_PRIORITY.getOrDefault(e.getKey(), 0)))
            .map(Map.Entry::getKey)
            .orElse(RvmStatus.UNKNOWN);

        double confidence = (statusScores.getOrDefault(winningStatus, 0.0) / totalWeight) * 100;
        confidence = adjustConfidenceByReportCount(confidence, validReportCount);

        // Get the most recent queue length from valid reports
        QueueLength latestQueueLength = reports.stream()
            .filter(r -> isReportValid(r, now))
            .filter(r -> r.getQueueLength() != null)
            .findFirst()
            .map(Report::getQueueLength)
            .orElse(null);

        return new RvmStatusResult(
            winningStatus,
            BigDecimal.valueOf(confidence).setScale(2, RoundingMode.HALF_UP),
            latestQueueLength,
            lastReportTime
        );
    }

    /**
     * Handle the special case where only BUSY reports exist and they've all expired.
     * Business logic: If BUSY expired, staff likely cleared it -> return low-confidence AVAILABLE.
     *
     * @return RvmStatusResult if this special case applies, null otherwise
     */
    private RvmStatusResult handleExpiredBusyReports(List<Report> allReports, LocalDateTime now, LocalDateTime lastReportTime) {
        // Check if ALL reports are BUSY and ALL are expired
        boolean allBusy = allReports.stream()
            .allMatch(r -> r.getStatus() == RvmStatus.BUSY);

        if (!allBusy) {
            return null;
        }

        boolean allExpired = allReports.stream()
            .noneMatch(r -> isReportValid(r, now));

        if (!allExpired) {
            return null;
        }

        // All reports were BUSY and all expired -> likely cleared by staff
        // Return low-confidence AVAILABLE (optimistic but cautious)
        log.debug("All BUSY reports expired for RVM, inferring low-confidence AVAILABLE");
        return new RvmStatusResult(RvmStatus.AVAILABLE, LOW_CONFIDENCE, null, lastReportTime);
    }

    /**
     * Check if a report is still valid based on its status-specific TTL.
     */
    private boolean isReportValid(Report report, LocalDateTime now) {
        if (report.getCreatedAt() == null || report.getStatus() == null) {
            return false;
        }

        Duration ttl = getTtlForStatus(report.getStatus());
        LocalDateTime expiresAt = report.getCreatedAt().plus(ttl);
        return now.isBefore(expiresAt);
    }

    /**
     * Get the TTL for a specific status.
     */
    private Duration getTtlForStatus(RvmStatus status) {
        return switch (status) {
            case AVAILABLE -> TTL_AVAILABLE;  // 24h - stable state
            case BROKEN -> TTL_BROKEN;        // 12h - long-tail state
            case BUSY -> TTL_BUSY;            // 3h - transient state
            default -> TTL_BUSY;              // Default to shortest TTL for safety
        };
    }

    private double calculateWeight(Report report, LocalDateTime now) {
        // Base weight
        double baseWeight = 100;

        // Time decay factor - faster decay for transient states
        double timeDecay = 1.0;
        if (report.getCreatedAt() != null) {
            double hoursAgo = Duration.between(report.getCreatedAt(), now).toMinutes() / 60.0;
            // Use status-specific decay rate
            double decayRate = getDecayRateForStatus(report.getStatus());
            timeDecay = Math.exp(-decayRate * hoursAgo);
        }

        // Verified bonus
        double verifiedBonus = Boolean.TRUE.equals(report.getVerified()) ? 1.5 : 1.0;

        return baseWeight * timeDecay * verifiedBonus;
    }

    /**
     * Get decay rate for a specific status.
     * Higher rate = faster decay.
     */
    private double getDecayRateForStatus(RvmStatus status) {
        return switch (status) {
            case AVAILABLE -> 0.1;   // Slow decay - stays relevant longer
            case BROKEN -> 0.2;      // Medium decay
            case BUSY -> 0.5;        // Fast decay - becomes irrelevant quickly
            default -> 0.5;
        };
    }

    private double adjustConfidenceByReportCount(double confidence, int reportCount) {
        double countFactor = Math.min(1.0, reportCount / 5.0);
        return confidence * (0.6 + 0.4 * countFactor);
    }
}
