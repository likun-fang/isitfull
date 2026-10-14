package com.ecoreturn.service;

import com.ecoreturn.dto.RvmStatusResult;
import com.ecoreturn.entity.Report;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.mapper.ReportMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class StatusCalculationServiceTest {

    @Mock
    private ReportMapper reportMapper;

    private StatusCalculationService service;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 2, 14, 12, 0, 0);

    @BeforeEach
    void setUp() {
        service = new StatusCalculationService(reportMapper);
    }

    @Test
    void emptyReports_returnsAvailableWithColdStartConfidence() {
        RvmStatusResult result = service.calculateStatusFromReports(Collections.emptyList(), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.AVAILABLE);
        assertThat(result.getConfidence()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(result.getQueueLength()).isNull();
        assertThat(result.getLastReportTime()).isNull();
    }

    @Test
    void nullReports_returnsAvailableWithColdStartConfidence() {
        RvmStatusResult result = service.calculateStatusFromReports(null, NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.AVAILABLE);
        assertThat(result.getConfidence()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(result.getQueueLength()).isNull();
        assertThat(result.getLastReportTime()).isNull();
    }

    @Test
    void singleRecentAvailableReport_returnsAvailable() {
        Report report = makeReport(RvmStatus.AVAILABLE, NOW.minusHours(1), false);
        RvmStatusResult result = service.calculateStatusFromReports(List.of(report), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.AVAILABLE);
        assertThat(result.getConfidence()).isNotNull();
        assertThat(result.getLastReportTime()).isEqualTo(NOW.minusHours(1));
    }

    @Test
    void singleRecentBrokenReport_returnsBroken() {
        Report report = makeReport(RvmStatus.BROKEN, NOW.minusHours(1), false);
        RvmStatusResult result = service.calculateStatusFromReports(List.of(report), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.BROKEN);
        assertThat(result.getConfidence()).isNotNull();
        assertThat(result.getLastReportTime()).isEqualTo(NOW.minusHours(1));
    }

    @Test
    void allBusyExpired_returnsAvailableWithLowConfidence() {
        // BUSY TTL = 3h, report is 4h ago -> expired
        Report report = makeReport(RvmStatus.BUSY, NOW.minusHours(4), false);
        RvmStatusResult result = service.calculateStatusFromReports(List.of(report), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.AVAILABLE);
        assertThat(result.getConfidence()).isEqualByComparingTo(new BigDecimal("30.00"));
    }

    @Test
    void brokenWinsTies_whenEqualWeight() {
        // Two reports at NOW: decay is 1.0 for both regardless of status-specific decay rate
        // Same time + same verified status + zero elapsed time = truly equal weight -> BROKEN wins tie
        Report broken = makeReport(RvmStatus.BROKEN, NOW, false);
        Report available = makeReport(RvmStatus.AVAILABLE, NOW, false);
        RvmStatusResult result = service.calculateStatusFromReports(List.of(broken, available), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.BROKEN);
    }

    @Test
    void expiredBrokenReport_returnsUnknownWithZeroConfidence() {
        // BROKEN TTL = 12h, report is 13h ago -> expired, not all-BUSY so falls through to UNKNOWN
        Report report = makeReport(RvmStatus.BROKEN, NOW.minusHours(13), false);
        RvmStatusResult result = service.calculateStatusFromReports(List.of(report), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.UNKNOWN);
        assertThat(result.getConfidence()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void verifiedReportHasHigherWeight() {
        // Verified AVAILABLE vs unverified BROKEN at the same time
        // Verified gets 1.5x weight bonus, so AVAILABLE should win
        Report verifiedAvailable = makeReport(RvmStatus.AVAILABLE, NOW.minusHours(1), true);
        Report unverifiedBroken = makeReport(RvmStatus.BROKEN, NOW.minusHours(1), false);
        RvmStatusResult result = service.calculateStatusFromReports(
                List.of(verifiedAvailable, unverifiedBroken), NOW);

        assertThat(result.getStatus()).isEqualTo(RvmStatus.AVAILABLE);
    }

    @Test
    void queueLengthFromMostRecentValidReport() {
        Report recent = makeReport(RvmStatus.BUSY, NOW.minusMinutes(30), false);
        recent.setQueueLength(QueueLength.LONG);

        Report older = makeReport(RvmStatus.BUSY, NOW.minusHours(1), false);
        older.setQueueLength(QueueLength.SHORT);

        // Reports ordered by created_at DESC (most recent first)
        RvmStatusResult result = service.calculateStatusFromReports(List.of(recent, older), NOW);

        assertThat(result.getQueueLength()).isEqualTo(QueueLength.LONG);
    }

    private Report makeReport(RvmStatus status, LocalDateTime createdAt, boolean verified) {
        Report r = new Report();
        r.setStatus(status);
        r.setCreatedAt(createdAt);
        r.setVerified(verified);
        return r;
    }
}
