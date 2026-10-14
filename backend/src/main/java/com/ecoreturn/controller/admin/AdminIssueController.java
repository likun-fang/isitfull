package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.config.AdminContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.admin.ResolveIssueRequest;
import com.ecoreturn.service.AdminAuditService;
import com.ecoreturn.service.AdminIssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/issues")
@RequiredArgsConstructor
public class AdminIssueController {

    private final AdminIssueService issueService;
    private final AdminAuditService auditService;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listIssues(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> issues = issueService.listIssues(status, page, size);
        int total = issueService.countIssues(status);
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(issues, meta));
    }

    @GetMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIssueDetail(
            @PathVariable Long id) {
        Map<String, Object> detail = issueService.getIssueDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PutMapping("/{id}/resolve")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> resolveIssue(
            @PathVariable Long id,
            @Valid @RequestBody ResolveIssueRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        issueService.resolveIssue(id, adminId, request.getResolution(), request.getNote());
        auditService.log(adminId, "RESOLVE_ISSUE", "ISSUE", id,
                Map.of("resolution", request.getResolution().getValue()));
        return ResponseEntity.ok(ApiResponse.success("Issue resolved successfully"));
    }
}
