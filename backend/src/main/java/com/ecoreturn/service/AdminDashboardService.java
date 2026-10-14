package com.ecoreturn.service;

import com.ecoreturn.dto.admin.DashboardStatsDto;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.RvmIssueReportMapper;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserMapper userMapper;
    private final RvmMapper rvmMapper;
    private final ReportMapper reportMapper;
    private final RvmIssueReportMapper issueReportMapper;

    public DashboardStatsDto getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        return DashboardStatsDto.builder()
                .totalUsers(userMapper.countTotal())
                .activeUsers30d(userMapper.countActiveAfter(thirtyDaysAgo))
                .newUsersToday(userMapper.countCreatedAfter(todayStart))
                .totalRvms(rvmMapper.selectCount(null))
                .brokenRvms(rvmMapper.countByStatusIn(List.of("BROKEN")))
                .totalReports(reportMapper.selectCount(null))
                .reportsToday(reportMapper.countReportsAfter(todayStart))
                .pendingIssues(issueReportMapper.countByStatus("PENDING"))
                .resolvedIssuesToday(issueReportMapper.countResolvedAfter(todayStart))
                .build();
    }
}
