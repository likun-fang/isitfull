package com.ecoreturn.controller;

import com.ecoreturn.annotation.RequireAuth;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.enums.FeedbackType;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.FeedbackService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequireAuth
    @RateLimit(rate = 5, rateInterval = 60, limitType = RateLimitType.USER,
            message = "Too many feedback submissions. Please try again later.")
    public ResponseEntity<ApiResponse<String>> submitFeedback(
            @RequestParam @NotNull(message = "Type is required") FeedbackType type,
            @RequestParam @NotBlank(message = "Message is required")
            @Size(max = 2000, message = "Message must be 2000 characters or less") String message,
            @RequestParam(required = false) MultipartFile screenshot) {

        Long userId = UserContext.getCurrentUserId();
        String result = feedbackService.createFeedback(userId, type, message, screenshot);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
