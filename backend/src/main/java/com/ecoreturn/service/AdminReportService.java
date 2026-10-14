package com.ecoreturn.service;

import com.ecoreturn.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final ReportMapper reportMapper;

    public List<Map<String, Object>> listReports(String status, Long rvmId, int page, int size) {
        int offset = (page - 1) * size;
        return reportMapper.listReportsWithDetails(status, rvmId, size, offset);
    }

    public int countReports(String status, Long rvmId) {
        return reportMapper.countReportsFiltered(status, rvmId);
    }

    public Map<String, Object> getReportDetail(Long id) {
        Map<String, Object> detail = reportMapper.getReportDetail(id);
        if (detail == null) {
            throw new IllegalArgumentException("Report not found with id: " + id);
        }
        return detail;
    }

    public void deleteReport(Long id) {
        int rows = reportMapper.deleteById(id);
        if (rows == 0) {
            throw new IllegalArgumentException("Report not found with id: " + id);
        }
    }
}
