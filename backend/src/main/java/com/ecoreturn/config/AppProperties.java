package com.ecoreturn.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app")
@Validated
public record AppProperties(
    LocationIq locationIq,
    Google google,
    Mapbox mapbox
) {
    public record LocationIq(
        @NotBlank String apiKey
    ) {}

    public record Google(
        @NotBlank String geocodingApiKey
    ) {}

    public record Mapbox(
        @NotBlank String accessToken,
        int monthlyLimit
    ) {
        public Mapbox {
            if (monthlyLimit <= 0) {
                monthlyLimit = 45000;
            }
        }
    }
}
