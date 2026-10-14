package com.ecoreturn.dto;

import com.ecoreturn.enums.IssueReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueReportRequest {

    @NotNull(message = "Reason is required")
    private IssueReason reason;
}
