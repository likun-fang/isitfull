package com.ecoreturn.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum UserRank {
    ECO_NEWBIE("Eco Newbie", 0),
    GREEN_SCOUT("Green Scout", 200),
    RVM_GUARDIAN("RVM Guardian", 1000),
    ECO_CHAMPION("Eco Champion", 3000),
    LEGEND("Eco Legend", 10000);

    private final String displayName;
    private final int minKarma;

    UserRank(String displayName, int minKarma) {
        this.displayName = displayName;
        this.minKarma = minKarma;
    }

    @JsonValue
    public String toJson() {
        return name();
    }

    public static UserRank fromKarma(int karma) {
        UserRank result = ECO_NEWBIE;
        for (UserRank rank : values()) {
            if (karma >= rank.minKarma) {
                result = rank;
            }
        }
        return result;
    }
}
