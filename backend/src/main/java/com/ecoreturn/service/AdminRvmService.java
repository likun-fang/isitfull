package com.ecoreturn.service;

import com.ecoreturn.dto.admin.AdminRvmRequest;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.mapper.RvmMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRvmService {

    private final RvmMapper rvmMapper;
    private final RvmGeoService geoService;

    public List<Rvm> listRvms(String city, int page, int size) {
        int offset = (page - 1) * size;
        if (city != null && !city.isBlank()) {
            return rvmMapper.listRvmsByCity(city.trim(), size, offset);
        }
        return rvmMapper.listRvms(size, offset);
    }

    public int countRvms(String city) {
        if (city != null && !city.isBlank()) {
            return rvmMapper.countRvmsByCity(city.trim());
        }
        return rvmMapper.selectCount(null).intValue();
    }

    public Rvm getRvmDetail(Long id) {
        Rvm rvm = rvmMapper.selectById(id);
        if (rvm == null) {
            throw new IllegalArgumentException("RVM not found with id: " + id);
        }
        return rvm;
    }

    public Rvm createRvm(AdminRvmRequest request) {
        Rvm rvm = new Rvm();
        rvm.setName(request.getName());
        rvm.setCity(request.getCity());
        rvm.setPostalCode(request.getPostalCode());
        rvm.setLatitude(request.getLatitude());
        rvm.setLongitude(request.getLongitude());
        rvm.setOpenHours(request.getOpenHours());
        rvm.setExternalId(request.getExternalId());
        rvm.setStatus(RvmStatus.UNKNOWN);
        rvmMapper.insert(rvm);
        return rvm;
    }

    public Rvm updateRvm(Long id, AdminRvmRequest request) {
        Rvm rvm = rvmMapper.selectById(id);
        if (rvm == null) {
            throw new IllegalArgumentException("RVM not found with id: " + id);
        }
        rvm.setName(request.getName());
        rvm.setCity(request.getCity());
        rvm.setPostalCode(request.getPostalCode());
        rvm.setLatitude(request.getLatitude());
        rvm.setLongitude(request.getLongitude());
        rvm.setOpenHours(request.getOpenHours());
        rvm.setExternalId(request.getExternalId());
        rvmMapper.updateById(rvm);
        return rvm;
    }

    public void deleteRvm(Long id) {
        Rvm rvm = rvmMapper.selectById(id);
        if (rvm == null) {
            throw new IllegalArgumentException("RVM not found with id: " + id);
        }
        rvmMapper.deleteById(id);
    }

    public Rvm updateRvmStatus(Long id, RvmStatus status, Boolean locked) {
        Rvm rvm = rvmMapper.selectById(id);
        if (rvm == null) {
            throw new IllegalArgumentException("RVM not found with id: " + id);
        }

        boolean adminLocked = Boolean.TRUE.equals(locked) || status == RvmStatus.REMOVED;
        rvmMapper.updateAdminStatus(id, status, adminLocked);

        if (status == RvmStatus.REMOVED) {
            geoService.removeRvm(id);
        } else {
            geoService.updateStatus(id, status, rvm.getConfidenceScore(), rvm.getQueueLength(), rvm.getStatusUpdatedAt());
        }

        log.info("Admin updated RVM {} status to {} (locked={})", id, status, adminLocked);
        return rvmMapper.selectById(id);
    }

    @Transactional
    public int batchImport(List<AdminRvmRequest> requests) {
        List<Rvm> created = new ArrayList<>();
        for (AdminRvmRequest request : requests) {
            Rvm rvm = new Rvm();
            rvm.setName(request.getName());
            rvm.setCity(request.getCity());
            rvm.setPostalCode(request.getPostalCode());
            rvm.setLatitude(request.getLatitude());
            rvm.setLongitude(request.getLongitude());
            rvm.setOpenHours(request.getOpenHours());
            rvm.setExternalId(request.getExternalId());
            rvm.setStatus(RvmStatus.UNKNOWN);
            rvmMapper.insert(rvm);
            created.add(rvm);
        }
        log.info("Batch imported {} RVMs", created.size());
        return created.size();
    }
}
