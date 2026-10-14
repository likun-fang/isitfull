package com.ecoreturn.service;

import com.ecoreturn.entity.AdminAuditLog;
import com.ecoreturn.mapper.AdminAuditLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditLogMapper auditLogMapper;
    private final ObjectMapper objectMapper;

    @Async
    public void log(Long adminId, String action, String targetType, Long targetId,
                    Map<String, Object> details) {
        try {
            String detailsJson = details != null ? objectMapper.writeValueAsString(details) : null;
            auditLogMapper.insertLog(adminId, action, targetType, targetId, detailsJson);
        } catch (Exception e) {
            log.error("Failed to write audit log: admin={}, action={}, target={}/{}",
                    adminId, action, targetType, targetId, e);
        }
    }

    public List<AdminAuditLog> listLogs(int page, int size) {
        int offset = (page - 1) * size;
        return auditLogMapper.listLogs(size, offset);
    }

    public int countLogs() {
        return auditLogMapper.selectCount(null).intValue();
    }
}
