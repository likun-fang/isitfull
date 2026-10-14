package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.annotation.RequireAuth;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.IssueReportRequest;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.RvmIssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rvms")
@RequiredArgsConstructor
public class RvmIssueController {

    private final RvmIssueService rvmIssueService;

    @PostMapping("/{rvmId}/issues")
    @RequireAuth
    @RateLimit(rate = 10, rateInterval = 60, limitType = RateLimitType.USER,
            message = "Too many issue reports. Please try again later.")
    public ResponseEntity<ApiResponse<String>> reportIssue(
            @PathVariable Long rvmId,
            @Valid @RequestBody IssueReportRequest request) {

        Long userId = UserContext.getCurrentUserId();
        String message = rvmIssueService.createIssueReport(rvmId, userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
