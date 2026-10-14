package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum AuthProvider {
    GUEST("GUEST"),
    GOOGLE("GOOGLE"),
    APPLE("APPLE");

    @EnumValue
    private final String value;

    AuthProvider(String value) {
        this.value = value;
    }
}
