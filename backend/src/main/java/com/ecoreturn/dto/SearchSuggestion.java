package com.ecoreturn.dto;

public record SearchSuggestion(
    String placeId,
    String displayName,
    String mainText,
    String secondaryText,
    double lat,
    double lng
) {}
