package com.ecoreturn.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdjustKarmaRequest {

    @NotNull(message = "Points is required")
    private Integer points;

    @NotBlank(message = "Reason is required")
    private String reason;
}
