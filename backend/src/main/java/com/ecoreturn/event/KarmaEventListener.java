package com.ecoreturn.event;

import com.ecoreturn.enums.KarmaReason;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.service.KarmaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Processes karma awards asynchronously after report transaction commits.
 * Uses @TransactionalEventListener(AFTER_COMMIT) to ensure the report
 * is persisted before awarding karma — prevents dirty data on rollback.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KarmaEventListener {

    private final KarmaService karmaService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReportCreated(ReportCreatedEvent event) {
        if (event.getUserId() == null) return;

        try {
            // Base karma for reporting
            karmaService.awardKarma(event.getUserId(), KarmaReason.REPORT,
                "REPORT", event.getReportId());

            // First report bonus
            if (event.isFirstReport()) {
                karmaService.awardKarma(event.getUserId(), KarmaReason.FIRST_REPORT,
                    "RVM", event.getRvmId());
            }

            // Correction bonus (BROKEN -> AVAILABLE)
            if (event.getPreviousRvmStatus() == RvmStatus.BROKEN
                && event.getReportedStatus() == RvmStatus.AVAILABLE) {
                karmaService.awardKarma(event.getUserId(), KarmaReason.CORRECTION,
                    "RVM", event.getRvmId());
            }
        } catch (Exception e) {
            log.error("Failed to process karma for report {}: {}",
                event.getReportId(), e.getMessage(), e);
        }
    }
}
