package com.ecoreturn.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalUsers;
    private long activeUsers30d;
    private long newUsersToday;
    private long totalRvms;
    private long brokenRvms;
    private long totalReports;
    private long reportsToday;
    private long pendingIssues;
    private long resolvedIssuesToday;
}
