package com.ecoreturn.dto;

public record AppConfigDto(
    String minVersion,
    boolean maintenanceMode,
    String maintenanceMessage
) {}
