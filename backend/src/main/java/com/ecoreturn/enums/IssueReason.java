package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum IssueReason {
    DOES_NOT_EXIST("DOES_NOT_EXIST"),
    WRONG_LOCATION("WRONG_LOCATION"),
    DUPLICATE("DUPLICATE"),
    OTHER("OTHER");

    @EnumValue
    private final String value;

    IssueReason(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
