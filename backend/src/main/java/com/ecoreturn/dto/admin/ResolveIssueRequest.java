package com.ecoreturn.dto.admin;

import com.ecoreturn.enums.IssueResolution;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolveIssueRequest {

    @NotNull(message = "Resolution is required")
    private IssueResolution resolution;

    private String note;
}
