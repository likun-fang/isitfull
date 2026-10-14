package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.config.AdminContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.admin.AdminLoginRequest;
import com.ecoreturn.dto.admin.AdminLoginResponse;
import com.ecoreturn.dto.admin.ChangePasswordRequest;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    @RateLimit(rate = 5, rateInterval = 60, limitType = RateLimitType.IP,
            message = "Too many login attempts. Please try again later.")
    public ResponseEntity<ApiResponse<AdminLoginResponse>> login(
            @Valid @RequestBody AdminLoginRequest request) {
        String token = adminAuthService.login(request.getUsername(), request.getPassword());
        AdminLoginResponse response = AdminLoginResponse.builder()
                .token(token)
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/change-password")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        adminAuthService.changePassword(adminId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
