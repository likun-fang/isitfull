package com.ecoreturn.dto;

import com.ecoreturn.enums.UserRank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDto {

    private Long reportId;
    private Boolean verified;
    private String message;
    private Integer karmaAwarded;
    private Integer totalKarma;

    // Level up info
    private Boolean leveledUp;
    private UserRank previousRank;
    private UserRank newRank;
}
