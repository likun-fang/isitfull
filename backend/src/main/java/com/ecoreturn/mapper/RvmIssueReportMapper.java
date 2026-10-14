package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.RvmIssueReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface RvmIssueReportMapper extends BaseMapper<RvmIssueReport> {

    @Select("SELECT COUNT(*) FROM rvm_issue_report " +
            "WHERE user_id = #{userId} AND rvm_id = #{rvmId} " +
            "AND created_at >= CURRENT_DATE")
    int countTodayByUserAndRvm(@Param("userId") Long userId, @Param("rvmId") Long rvmId);

    @Select("SELECT COUNT(*) FROM rvm_issue_report WHERE status = #{status}")
    long countByStatus(@Param("status") String status);

    @Select("SELECT COUNT(*) FROM rvm_issue_report WHERE status = 'RESOLVED' AND resolved_at >= #{cutoff}")
    long countResolvedAfter(@Param("cutoff") LocalDateTime cutoff);

    @Select("SELECT i.*, u.display_name as reporter_name, u.email as reporter_email, " +
            "r.name as rvm_name, r.city as rvm_city " +
            "FROM rvm_issue_report i " +
            "LEFT JOIN users u ON i.user_id = u.id " +
            "LEFT JOIN rvm r ON i.rvm_id = r.id " +
            "WHERE i.status = #{status} " +
            "ORDER BY i.created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<Map<String, Object>> listIssuesWithDetails(
            @Param("status") String status,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Select("SELECT COUNT(*) FROM rvm_issue_report WHERE status = #{status}")
    int countIssuesByStatus(@Param("status") String status);

    @Select("SELECT i.*, u.display_name as reporter_name, u.email as reporter_email, " +
            "r.name as rvm_name, r.city as rvm_city, r.latitude as rvm_lat, r.longitude as rvm_lng " +
            "FROM rvm_issue_report i " +
            "LEFT JOIN users u ON i.user_id = u.id " +
            "LEFT JOIN rvm r ON i.rvm_id = r.id " +
            "WHERE i.id = #{id}")
    Map<String, Object> getIssueDetail(@Param("id") Long id);
}
