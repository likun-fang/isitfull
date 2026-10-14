package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.DashboardStatsDto;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for statistics endpoints.
 * Provides dashboard metrics for the web landing page.
 */
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /**
     * Gets dashboard statistics for the web landing page.
     * Response is cached in Redis for 10 minutes.
     *
     * @return ApiResponse containing DashboardStatsDto
     */
    @GetMapping("/dashboard")
    @RateLimit(rate = 120, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = statsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
