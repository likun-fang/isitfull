package com.ecoreturn.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestLoginRequest {
    @NotBlank(message = "Device ID is required")
    private String deviceId;
}
