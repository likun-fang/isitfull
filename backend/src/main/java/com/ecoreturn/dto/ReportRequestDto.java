package com.ecoreturn.dto;

import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReportRequestDto {

    @NotNull(message = "Status is required")
    private RvmStatus status;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private QueueLength queueLength;  // Optional
}
