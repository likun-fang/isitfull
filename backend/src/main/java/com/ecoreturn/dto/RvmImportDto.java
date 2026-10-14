package com.ecoreturn.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO for importing RVM data from external JSON files.
 * Maps the external data format to internal representation.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RvmImportDto {

    private String id;

    private String title;

    private String city;

    @JsonProperty("postal_code")
    private String postalCode;

    private String lat;

    private String lng;

    @JsonProperty("open_hours")
    private String openHours;
}
