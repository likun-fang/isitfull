package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.AdminAuditLog;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AdminAuditLogMapper extends BaseMapper<AdminAuditLog> {

    @Insert("INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details) " +
            "VALUES (#{adminId}, #{action}, #{targetType}, #{targetId}, #{details}::jsonb)")
    void insertLog(@Param("adminId") Long adminId,
                   @Param("action") String action,
                   @Param("targetType") String targetType,
                   @Param("targetId") Long targetId,
                   @Param("details") String details);

    @Select("SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<AdminAuditLog> listLogs(@Param("limit") int limit, @Param("offset") int offset);
}
