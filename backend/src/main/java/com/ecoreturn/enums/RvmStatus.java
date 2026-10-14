package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum RvmStatus {
    AVAILABLE("AVAILABLE"),
    BUSY("BUSY"),
    BROKEN("BROKEN"),
    UNKNOWN("UNKNOWN"),
    REMOVED("REMOVED");

    @EnumValue
    private final String value;

    RvmStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
