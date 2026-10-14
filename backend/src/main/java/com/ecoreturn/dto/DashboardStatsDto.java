package com.ecoreturn.dto;

import java.time.Instant;

/**
 * DTO for dashboard statistics.
 * Used by the web landing page to display community metrics.
 */
public record DashboardStatsDto(
    int todayReports,
    double activeRate,
    String topContributor,
    Instant cachedAt
) {}
