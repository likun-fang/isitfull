package com.ecoreturn.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminLoginResponse {
    private String token;
    private String displayName;
}
