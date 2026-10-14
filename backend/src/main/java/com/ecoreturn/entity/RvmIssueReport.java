package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.ecoreturn.enums.IssueReason;
import com.ecoreturn.enums.IssueResolution;
import com.ecoreturn.enums.IssueStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("rvm_issue_report")
public class RvmIssueReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long rvmId;

    private Long userId;

    private IssueReason reason;

    private IssueStatus status;

    private IssueResolution resolution;

    private Long resolvedBy;

    private LocalDateTime resolvedAt;

    private String adminNote;

    private LocalDateTime createdAt;
}
