package com.ecoreturn.dto;

import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RvmStatusResult {
    private RvmStatus status;
    private BigDecimal confidence;
    private QueueLength queueLength;
    private LocalDateTime lastReportTime;

    public RvmStatusResult(RvmStatus status, BigDecimal confidence) {
        this.status = status;
        this.confidence = confidence;
        this.queueLength = null;
        this.lastReportTime = null;
    }

    public RvmStatusResult(RvmStatus status, BigDecimal confidence, QueueLength queueLength) {
        this.status = status;
        this.confidence = confidence;
        this.queueLength = queueLength;
        this.lastReportTime = null;
    }
}
