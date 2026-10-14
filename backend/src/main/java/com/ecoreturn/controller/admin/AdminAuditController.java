package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.entity.AdminAuditLog;
import com.ecoreturn.service.AdminAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditService auditService;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<AdminAuditLog>>> listAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<AdminAuditLog> logs = auditService.listLogs(page, size);
        int total = auditService.countLogs();
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs, meta));
    }
}
