package com.ecoreturn.dto;

import com.ecoreturn.entity.Rvm;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.enums.UserRank;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RvmDto {

    private Long id;
    private String name;
    private String city;
    private String postalCode;
    private Double lat;
    private Double lng;
    private RvmStatus status;
    private QueueLength queueLength;
    private BigDecimal confidenceScore;
    private LocalDateTime statusUpdatedAt;
    private Integer distanceMeters;

    // Reporter info for gamification
    private ReporterInfo lastReporter;

    @Data
    public static class ReporterInfo {
        private String displayName;
        private UserRank rank;
    }

    public static RvmDto fromEntity(Rvm rvm, Integer distanceMeters) {
        RvmDto dto = new RvmDto();
        dto.id = rvm.getId();
        dto.name = rvm.getName();
        dto.city = rvm.getCity();
        dto.postalCode = rvm.getPostalCode();
        dto.lat = rvm.getLatitude();
        dto.lng = rvm.getLongitude();
        dto.status = rvm.getStatus();
        dto.queueLength = rvm.getQueueLength();
        dto.confidenceScore = rvm.getConfidenceScore();
        dto.statusUpdatedAt = rvm.getStatusUpdatedAt();
        dto.distanceMeters = distanceMeters;
        return dto;
    }

    public void setReporterInfo(String displayName, int karmaPoints) {
        if (displayName != null) {
            this.lastReporter = new ReporterInfo();
            this.lastReporter.setDisplayName(displayName);
            this.lastReporter.setRank(UserRank.fromKarma(karmaPoints));
        }
    }
}
