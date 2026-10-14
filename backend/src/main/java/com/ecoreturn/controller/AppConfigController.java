package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.AppConfigDto;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.AppConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/app-config")
@RequiredArgsConstructor
public class AppConfigController {

    private final AppConfigService appConfigService;

    @GetMapping
    @RateLimit(rate = 30, rateInterval = 60, limitType = RateLimitType.IP,
            message = "Too many requests. Please try again later.")
    public ApiResponse<AppConfigDto> getConfig() {
        return ApiResponse.success(appConfigService.getConfig());
    }
}
