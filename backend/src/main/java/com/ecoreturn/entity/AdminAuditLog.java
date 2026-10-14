package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("admin_audit_log")
public class AdminAuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long adminId;

    private String action;

    private String targetType;

    private Long targetId;

    private String details;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
