package com.ecoreturn.service;

import com.ecoreturn.entity.RvmIssueReport;
import com.ecoreturn.enums.IssueReason;
import com.ecoreturn.mapper.RvmIssueReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RvmIssueService {

    private final RvmIssueReportMapper issueReportMapper;
    private final RvmService rvmService;

    public String createIssueReport(Long rvmId, Long userId, IssueReason reason) {
        if (rvmService.findEntityById(rvmId) == null) {
            throw new IllegalArgumentException("RVM not found with id: " + rvmId);
        }

        int todayCount = issueReportMapper.countTodayByUserAndRvm(userId, rvmId);
        if (todayCount > 0) {
            throw new IllegalStateException(
                "You have already reported an issue for this machine today."
            );
        }

        RvmIssueReport report = new RvmIssueReport();
        report.setRvmId(rvmId);
        report.setUserId(userId);
        report.setReason(reason);
        issueReportMapper.insert(report);

        return "Thanks! We'll verify this shortly.";
    }
}
