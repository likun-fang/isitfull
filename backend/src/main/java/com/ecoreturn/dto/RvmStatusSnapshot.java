package com.ecoreturn.dto;

import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Snapshot of an RVM's current status fields from the database.
 * Used for dirty checking: compare current DB state against newly calculated state.
 */
@Data
public class RvmStatusSnapshot {
    private Long id;
    private RvmStatus status;
    private BigDecimal confidenceScore;
    private QueueLength queueLength;
    private LocalDateTime statusUpdatedAt;

    private static final BigDecimal CONFIDENCE_TOLERANCE = new BigDecimal("1.0");

    /**
     * Dirty check: compare against a newly calculated result.
     * Tolerance strategy:
     * - status: direct enum comparison
     * - confidence: difference > 1.0 counts as dirty
     * - queueLength: direct comparison (nullable)
     * - statusUpdatedAt: NOT compared (derived from lastReportTime)
     */
    public boolean isDirty(RvmStatusResult newResult) {
        if (newResult == null) return false;

        // Status changed -> dirty
        if (this.status != newResult.getStatus()) return true;

        // QueueLength changed -> dirty
        if (!Objects.equals(this.queueLength, newResult.getQueueLength())) return true;

        // Confidence difference exceeds tolerance -> dirty
        if (this.confidenceScore == null && newResult.getConfidence() != null) return true;
        if (this.confidenceScore != null && newResult.getConfidence() == null) return true;
        if (this.confidenceScore != null && newResult.getConfidence() != null) {
            BigDecimal diff = this.confidenceScore.subtract(newResult.getConfidence()).abs();
            if (diff.compareTo(CONFIDENCE_TOLERANCE) > 0) return true;
        }

        return false;
    }
}
