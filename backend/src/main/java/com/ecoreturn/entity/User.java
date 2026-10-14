package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.ecoreturn.enums.AuthProvider;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private AuthProvider provider;
    private String providerId;
    private String email;
    private String displayName;
    private String avatarUrl;

    private Integer karmaPoints = 0;
    private Integer reportCount = 0;
    private Integer firstReportCount = 0;
    private Integer correctionCount = 0;

    @Version
    private Integer version = 0;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    private LocalDateTime lastActiveAt;
    private LocalDateTime deletedAt;
}
