package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.config.AdminContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.service.AdminAuditService;
import com.ecoreturn.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService reportService;
    private final AdminAuditService auditService;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listReports(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(required = false) Long rvmId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> reports = reportService.listReports(status, rvmId, page, size);
        int total = reportService.countReports(status, rvmId);
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(reports, meta));
    }

    @GetMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportDetail(
            @PathVariable Long id) {
        Map<String, Object> detail = reportService.getReportDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> deleteReport(
            @PathVariable Long id) {
        Long adminId = AdminContext.getCurrentAdminId();
        reportService.deleteReport(id);
        auditService.log(adminId, "DELETE_REPORT", "REPORT", id, null);
        return ResponseEntity.ok(ApiResponse.success("Report deleted successfully"));
    }
}
