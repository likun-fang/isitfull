package com.ecoreturn.event;

import com.ecoreturn.enums.RvmStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after a status report is created.
 * Consumed by async listeners for karma processing.
 */
@Getter
public class ReportCreatedEvent extends ApplicationEvent {
    private final Long reportId;
    private final Long rvmId;
    private final Long userId;
    private final RvmStatus reportedStatus;
    private final RvmStatus previousRvmStatus;
    private final boolean firstReport;

    public ReportCreatedEvent(Object source, Long reportId, Long rvmId, Long userId,
                              RvmStatus reportedStatus, RvmStatus previousRvmStatus,
                              boolean firstReport) {
        super(source);
        this.reportId = reportId;
        this.rvmId = rvmId;
        this.userId = userId;
        this.reportedStatus = reportedStatus;
        this.previousRvmStatus = previousRvmStatus;
        this.firstReport = firstReport;
    }
}
