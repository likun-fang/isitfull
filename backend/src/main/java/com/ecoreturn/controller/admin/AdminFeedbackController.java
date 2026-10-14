package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.service.AdminFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final AdminFeedbackService feedbackService;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listFeedback(
            @RequestParam(defaultValue = "") String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> feedback = feedbackService.listFeedback(type, page, size);
        int total = feedbackService.countFeedback(type);
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(feedback, meta));
    }
}
