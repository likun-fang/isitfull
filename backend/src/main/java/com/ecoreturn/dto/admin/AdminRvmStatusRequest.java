package com.ecoreturn.dto.admin;

import com.ecoreturn.enums.RvmStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRvmStatusRequest {

    @NotNull(message = "Status is required")
    private RvmStatus status;

    private Boolean locked;
}
