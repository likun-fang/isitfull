package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.ecoreturn.enums.KarmaReason;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("karma_logs")
public class KarmaLog {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;
    private Integer points;
    private KarmaReason reason;
    private String refType;
    private Long refId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
