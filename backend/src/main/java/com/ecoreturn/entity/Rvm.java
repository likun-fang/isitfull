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
@TableName("rvm")
public class Rvm {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String externalId;

    private String name;

    private String city;

    private String postalCode;

    private Double latitude;

    private Double longitude;

    private String openHours;

    private RvmStatus status;

    private QueueLength queueLength;

    private BigDecimal confidenceScore;

    private LocalDateTime statusUpdatedAt;

    private LocalDateTime lastCalculatedAt;

    private Boolean adminLocked;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
