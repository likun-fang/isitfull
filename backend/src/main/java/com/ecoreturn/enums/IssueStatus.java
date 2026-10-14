package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum IssueStatus {
    PENDING("PENDING"),
    RESOLVED("RESOLVED"),
    IGNORED("IGNORED");

    @EnumValue
    private final String value;

    IssueStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
