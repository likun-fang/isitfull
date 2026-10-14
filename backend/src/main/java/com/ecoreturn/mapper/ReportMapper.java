package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.Report;
import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ReportMapper extends BaseMapper<Report> {

    @Select("SELECT * FROM report " +
            "WHERE rvm_id = #{rvmId} " +
            "AND created_at > #{cutoff} " +
            "ORDER BY created_at DESC")
    List<Report> findRecentReports(@Param("rvmId") Long rvmId, @Param("cutoff") LocalDateTime cutoff);

    // Defensive LIMIT 50000: under normal conditions, 24h reports are far below this
    // Only select fields needed for status calculation to reduce memory footprint
    @Select("SELECT id, rvm_id, status, created_at, verified, queue_length " +
            "FROM report WHERE created_at > #{cutoff} " +
            "ORDER BY rvm_id, created_at DESC LIMIT 50000")
    List<Report> findAllRecentReports(@Param("cutoff") LocalDateTime cutoff);

    @Select("SELECT COUNT(*) FROM report WHERE created_at >= #{cutoff}")
    int countReportsAfter(@Param("cutoff") LocalDateTime cutoff);

    @Select("SELECT u.display_name as reporterName, u.karma_points as reporterKarma " +
            "FROM report r " +
            "LEFT JOIN users u ON r.user_id = u.id " +
            "WHERE r.rvm_id = #{rvmId} " +
            "ORDER BY r.created_at DESC " +
            "LIMIT 1")
    ReportWithReporter findLatestReportWithReporter(@Param("rvmId") Long rvmId);

    @Data
    class ReportWithReporter {
        private String reporterName;
        private Integer reporterKarma;
    }

    // Admin queries

    @Select({"<script>",
            "SELECT r.*, u.display_name as reporter_name, u.email as reporter_email, ",
            "v.name as rvm_name, v.city as rvm_city ",
            "FROM report r ",
            "LEFT JOIN users u ON r.user_id = u.id ",
            "LEFT JOIN rvm v ON r.rvm_id = v.id ",
            "<where>",
            "  <if test='status != null and status != \"\"'>AND r.status = #{status}</if>",
            "  <if test='rvmId != null'>AND r.rvm_id = #{rvmId}</if>",
            "</where>",
            "ORDER BY r.created_at DESC LIMIT #{limit} OFFSET #{offset}",
            "</script>"})
    List<Map<String, Object>> listReportsWithDetails(
            @Param("status") String status,
            @Param("rvmId") Long rvmId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Select({"<script>",
            "SELECT COUNT(*) FROM report r ",
            "<where>",
            "  <if test='status != null and status != \"\"'>AND r.status = #{status}</if>",
            "  <if test='rvmId != null'>AND r.rvm_id = #{rvmId}</if>",
            "</where>",
            "</script>"})
    int countReportsFiltered(
            @Param("status") String status,
            @Param("rvmId") Long rvmId);

    @Select("SELECT r.*, u.display_name as reporter_name, u.email as reporter_email, " +
            "v.name as rvm_name, v.city as rvm_city " +
            "FROM report r " +
            "LEFT JOIN users u ON r.user_id = u.id " +
            "LEFT JOIN rvm v ON r.rvm_id = v.id " +
            "WHERE r.id = #{id}")
    Map<String, Object> getReportDetail(@Param("id") Long id);
}
