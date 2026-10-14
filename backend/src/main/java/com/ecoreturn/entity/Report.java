package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("report")
public class Report {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long rvmId;

    private Long userId;

    private RvmStatus status;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Integer distanceMeters;

    private Boolean verified;

    private QueueLength queueLength;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
