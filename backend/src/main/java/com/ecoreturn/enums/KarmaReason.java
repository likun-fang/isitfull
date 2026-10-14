package com.ecoreturn.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum KarmaReason {
    REPORT("REPORT", 5),
    FIRST_REPORT("FIRST_REPORT", 15),
    CORRECTION("CORRECTION", 10),
    ADMIN_ADJUST("ADMIN_ADJUST", 0);

    @EnumValue
    private final String value;
    private final int defaultPoints;

    KarmaReason(String value, int defaultPoints) {
        this.value = value;
        this.defaultPoints = defaultPoints;
    }
}
