package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.dto.*;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/guest")
    @RateLimit(rate = 10, rateInterval = 60, limitType = RateLimitType.IP,
            message = "Too many registration attempts. Please try again later.")
    public ResponseEntity<ApiResponse<AuthResponse>> guestLogin(
            @Valid @RequestBody GuestLoginRequest request) {
        AuthResponse response = authService.guestLogin(request.getDeviceId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @RateLimit(rate = 30, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/firebase")
    @RateLimit(rate = 20, rateInterval = 60, limitType = RateLimitType.IP,
            message = "Too many login attempts. Please try again later.")
    public ResponseEntity<ApiResponse<AuthResponse>> firebaseLogin(
            @Valid @RequestBody FirebaseLoginRequest request) {
        AuthResponse response = authService.firebaseLogin(
                request.getFirebaseToken(),
                request.getCurrentDeviceId()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
