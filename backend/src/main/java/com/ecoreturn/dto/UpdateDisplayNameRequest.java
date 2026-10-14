package com.ecoreturn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDisplayNameRequest {

    @NotBlank(message = "Display name cannot be empty")
    @Size(min = 2, max = 30, message = "Display name must be between 2 and 30 characters")
    private String displayName;
}
