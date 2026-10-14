package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

public enum FeedbackType {
    BUG("BUG"),
    FEATURE("FEATURE");

    @EnumValue
    private final String value;

    FeedbackType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
