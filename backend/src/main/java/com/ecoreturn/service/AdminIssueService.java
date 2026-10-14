package com.ecoreturn.service;

import com.ecoreturn.entity.RvmIssueReport;
import com.ecoreturn.enums.IssueResolution;
import com.ecoreturn.enums.IssueStatus;
import com.ecoreturn.mapper.RvmIssueReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminIssueService {

    private final RvmIssueReportMapper issueReportMapper;

    public List<Map<String, Object>> listIssues(String status, int page, int size) {
        int offset = (page - 1) * size;
        return issueReportMapper.listIssuesWithDetails(status, size, offset);
    }

    public int countIssues(String status) {
        return issueReportMapper.countIssuesByStatus(status);
    }

    public Map<String, Object> getIssueDetail(Long id) {
        Map<String, Object> detail = issueReportMapper.getIssueDetail(id);
        if (detail == null) {
            throw new IllegalArgumentException("Issue not found with id: " + id);
        }
        return detail;
    }

    public void resolveIssue(Long id, Long adminId, IssueResolution resolution, String note) {
        RvmIssueReport report = issueReportMapper.selectById(id);
        if (report == null) {
            throw new IllegalArgumentException("Issue not found with id: " + id);
        }

        if (report.getStatus() == IssueStatus.RESOLVED) {
            throw new IllegalStateException("Issue is already resolved");
        }

        report.setStatus(IssueStatus.RESOLVED);
        report.setResolution(resolution);
        report.setResolvedBy(adminId);
        report.setResolvedAt(LocalDateTime.now());
        report.setAdminNote(note);
        issueReportMapper.updateById(report);
    }
}
