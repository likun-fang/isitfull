package com.ecoreturn.controller.admin;

import com.ecoreturn.annotation.RequireAdmin;
import com.ecoreturn.client.ReturnApiClient;
import com.ecoreturn.config.AdminContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.RvmImportDto;
import com.ecoreturn.dto.RvmSyncResult;
import com.ecoreturn.dto.admin.AdminRvmRequest;
import com.ecoreturn.dto.admin.AdminRvmStatusRequest;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.service.AdminAuditService;
import com.ecoreturn.service.AdminRvmService;
import com.ecoreturn.service.RvmGeoService;
import com.ecoreturn.service.RvmImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/rvms")
@RequiredArgsConstructor
public class AdminRvmController {

    private final AdminRvmService rvmService;
    private final AdminAuditService auditService;
    private final ReturnApiClient returnApiClient;
    private final RvmImportService rvmImportService;
    private final RvmGeoService geoService;
    private final RvmMapper rvmMapper;

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<Rvm>>> listRvms(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Rvm> rvms = rvmService.listRvms(city, page, size);
        int total = rvmService.countRvms(city);
        ApiResponse.Meta meta = new ApiResponse.Meta(total, page, size);
        return ResponseEntity.ok(ApiResponse.success(rvms, meta));
    }

    @GetMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Rvm>> getRvmDetail(@PathVariable Long id) {
        Rvm rvm = rvmService.getRvmDetail(id);
        return ResponseEntity.ok(ApiResponse.success(rvm));
    }

    @PostMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<Rvm>> createRvm(
            @Valid @RequestBody AdminRvmRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        Rvm rvm = rvmService.createRvm(request);
        auditService.log(adminId, "CREATE_RVM", "RVM", rvm.getId(), null);
        return ResponseEntity.ok(ApiResponse.success(rvm));
    }

    @PutMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Rvm>> updateRvm(
            @PathVariable Long id,
            @Valid @RequestBody AdminRvmRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        Rvm rvm = rvmService.updateRvm(id, request);
        auditService.log(adminId, "UPDATE_RVM", "RVM", rvm.getId(), null);
        return ResponseEntity.ok(ApiResponse.success(rvm));
    }

    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> deleteRvm(@PathVariable Long id) {
        Long adminId = AdminContext.getCurrentAdminId();
        rvmService.deleteRvm(id);
        auditService.log(adminId, "DELETE_RVM", "RVM", id, null);
        return ResponseEntity.ok(ApiResponse.success("RVM deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Rvm>> updateRvmStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminRvmStatusRequest request) {
        Long adminId = AdminContext.getCurrentAdminId();
        Rvm rvm = rvmService.updateRvmStatus(id, request.getStatus(), request.getLocked());
        auditService.log(adminId, "UPDATE_RVM_STATUS", "RVM", id,
                Map.of("status", request.getStatus().getValue(),
                       "locked", Boolean.TRUE.equals(request.getLocked()) || request.getStatus().getValue().equals("REMOVED")));
        return ResponseEntity.ok(ApiResponse.success(rvm));
    }

    @PostMapping("/batch")
    @RequireAdmin
    public ResponseEntity<ApiResponse<String>> batchImport(
            @Valid @RequestBody List<AdminRvmRequest> requests) {
        Long adminId = AdminContext.getCurrentAdminId();
        int count = rvmService.batchImport(requests);
        auditService.log(adminId, "BATCH_IMPORT_RVM", "RVM", null,
                Map.of("count", count));
        return ResponseEntity.ok(ApiResponse.success("Imported " + count + " RVMs"));
    }

    @PostMapping("/sync")
    @RequireAdmin
    public ResponseEntity<ApiResponse<RvmSyncResult>> syncFromApi() {
        Long adminId = AdminContext.getCurrentAdminId();
        log.info("Admin {} triggered manual RVM sync", adminId);

        List<RvmImportDto> rvms = returnApiClient.fetchAllRvms();
        if (rvms.isEmpty()) {
            RvmSyncResult empty = RvmSyncResult.builder()
                    .fetched(0).upserted(0).newCount(0).removedCount(0)
                    .newRvmNames(List.of()).removedExternalIds(List.of())
                    .build();
            return ResponseEntity.ok(ApiResponse.success(empty));
        }

        RvmSyncResult result = rvmImportService.importFromList(rvms);

        try {
            List<Rvm> allRvms = rvmMapper.selectList(null);
            geoService.atomicRefreshCache(allRvms);
        } catch (Exception e) {
            log.error("Cache refresh after manual sync failed: {}", e.getMessage());
        }

        auditService.log(adminId, "SYNC_RVM_API", "RVM", null,
                Map.of("fetched", result.getFetched(),
                       "upserted", result.getUpserted(),
                       "new", result.getNewCount(),
                       "removed", result.getRemovedCount(),
                       "newRvmNames", result.getNewRvmNames(),
                       "removedExternalIds", result.getRemovedExternalIds()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
