package com.ecoreturn.controller;

import com.ecoreturn.annotation.RequireAuth;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.ReportRequestDto;
import com.ecoreturn.dto.ReportResponseDto;
import com.ecoreturn.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rvms")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/{rvmId}/reports")
    @RequireAuth
    public ApiResponse<ReportResponseDto> createReport(
            @PathVariable Long rvmId,
            @Valid @RequestBody ReportRequestDto request) {

        Long userId = UserContext.getCurrentUserId();

        ReportResponseDto response = reportService.createReport(rvmId, userId, request);
        return ApiResponse.success(response);
    }
}
