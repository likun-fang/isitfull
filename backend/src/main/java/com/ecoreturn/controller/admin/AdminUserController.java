package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.config.AdminContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.admin.AdjustKarmaRequest;
import com.ecoreturn.entity.User;
import com.ecoreturn.service.AdminAuditService;
import com.ecoreturn.service.AdminUserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserManagementService userManagementService;
    private final AdminAuditService auditService;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<User>>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<User> users = userManagementService.listUsers(search, page, size);
        int total = userManagementService.countUsers(search);
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(users, meta));
    }

    @GetMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<User>> getUserDetail(@PathVariable Long id) {
        User user = userManagementService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}/ban")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> banUser(@PathVariable Long id) {
        Long adminId = AdminContext.getCurrentAdminId();
        userManagementService.banUser(id);
        auditService.log(adminId, "BAN_USER", "USER", id, null);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully"));
    }

    @PutMapping("/{id}/unban")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> unbanUser(@PathVariable Long id) {
        Long adminId = AdminContext.getCurrentAdminId();
        userManagementService.unbanUser(id);
        auditService.log(adminId, "UNBAN_USER", "USER", id, null);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully"));
    }

    @PostMapping("/{id}/karma")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> adjustKarma(
            @PathVariable Long id,
            @Valid @RequestBody AdjustKarmaRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        userManagementService.adjustKarma(id, request.getPoints(), request.getReason());
        auditService.log(adminId, "ADJUST_KARMA", "USER", id,
                Map.of("points", request.getPoints(), "reason", request.getReason()));
        return ResponseEntity.ok(ApiResponse.success("Karma adjusted successfully"));
    }
}
