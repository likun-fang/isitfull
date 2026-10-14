package com.ecoreturn.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FirebaseLoginRequest {
    @NotBlank(message = "Firebase token is required")
    private String firebaseToken;

    private String currentDeviceId;
}
