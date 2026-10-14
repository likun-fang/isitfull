package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum IssueResolution {
    FIXED("FIXED"),
    IGNORED("IGNORED"),
    DUPLICATE("DUPLICATE"),
    INVALID("INVALID");

    @EnumValue
    private final String value;

    IssueResolution(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
