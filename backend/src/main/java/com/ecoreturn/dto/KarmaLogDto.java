package com.ecoreturn.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class KarmaLogDto {
    private String id;
    private int points;
    private String reason;
    private String refType;
    private String refId;
    private String rvmName;
    private LocalDateTime createdAt;
}
