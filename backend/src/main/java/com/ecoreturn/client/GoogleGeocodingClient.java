package com.ecoreturn.client;

import com.ecoreturn.config.AppProperties;
import com.ecoreturn.dto.SearchSuggestion;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@Component
public class GoogleGeocodingClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleGeocodingClient.class);
    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public GoogleGeocodingClient(RestTemplate restTemplate, AppProperties appProperties) {
        this.restTemplate = restTemplate;
        this.apiKey = appProperties.google().geocodingApiKey();
    }

    public Optional<SearchSuggestion> geocodeEircode(String eircode) {
        if (eircode == null || eircode.isBlank()) {
            return Optional.empty();
        }

        String normalizedEircode = normalizeEircode(eircode);

        // Build URI object to prevent double encoding by RestTemplate
        URI uri = UriComponentsBuilder.fromHttpUrl(GEOCODING_URL)
                .queryParam("address", normalizedEircode)
                .queryParam("components", "country:IE")
                .queryParam("key", apiKey)
                .build()
                .toUri();

        try {
            log.info("Calling Google Geocoding API for Eircode: {}, URI: {}", normalizedEircode, uri.toString().replaceAll("key=[^&]+", "key=***"));

            // Use URI object instead of String to prevent double encoding
            GeocodingResponse response = restTemplate.getForObject(uri, GeocodingResponse.class);
            log.info("Google Geocoding response status: {}, results count: {}",
                    response != null ? response.status : "null",
                    response != null && response.results != null ? response.results.size() : 0);

            if (response == null || response.results == null || response.results.isEmpty()) {
                log.warn("No results for Eircode: {}", normalizedEircode);
                return Optional.empty();
            }

            GeocodingResult result = response.results.get(0);
            log.info("Google Geocoding result - placeId: {}, address: {}, types: {}, lat: {}, lng: {}",
                    result.placeId, result.formattedAddress, result.types,
                    result.geometry != null && result.geometry.location != null ? result.geometry.location.lat : "null",
                    result.geometry != null && result.geometry.location != null ? result.geometry.location.lng : "null");

            // Reject country-level fallback results (Google returns "Ireland" when it can't find the Eircode)
            if (isCountryLevelFallback(result)) {
                log.warn("Google returned country-level fallback for Eircode: {} (address: {}), treating as not found",
                        normalizedEircode, result.formattedAddress);
                return Optional.empty();
            }

            SearchSuggestion suggestion = toSearchSuggestion(result, normalizedEircode);
            log.info("Created SearchSuggestion - lat: {}, lng: {}", suggestion.lat(), suggestion.lng());
            return Optional.of(suggestion);
        } catch (RestClientException e) {
            log.error("Google Geocoding failed for Eircode: {}", normalizedEircode, e);
            return Optional.empty();
        }
    }

    private String normalizeEircode(String eircode) {
        String cleaned = eircode.toUpperCase().replaceAll("\\s+", "");
        if (cleaned.length() == 7) {
            return cleaned.substring(0, 3) + " " + cleaned.substring(3);
        }
        return eircode.toUpperCase().trim();
    }

    /**
     * Detects if Google returned a country-level fallback instead of a specific address.
     * This happens when Google can't find the Eircode but returns "Ireland" as a best guess.
     */
    private boolean isCountryLevelFallback(GeocodingResult result) {
        // Check types - if it's just "country" or "political", it's a fallback
        if (result.types != null) {
            boolean hasOnlyCountryTypes = result.types.stream()
                    .allMatch(type -> type.equals("country") || type.equals("political"));
            if (hasOnlyCountryTypes && !result.types.isEmpty()) {
                return true;
            }
        }

        // Also check if formatted_address is just "Ireland" (case-insensitive)
        if (result.formattedAddress != null &&
                result.formattedAddress.trim().equalsIgnoreCase("Ireland")) {
            return true;
        }

        return false;
    }

    private SearchSuggestion toSearchSuggestion(GeocodingResult result, String eircode) {
        double lat = 0.0;
        double lng = 0.0;

        if (result.geometry != null && result.geometry.location != null) {
            lat = result.geometry.location.lat;
            lng = result.geometry.location.lng;
        }

        return new SearchSuggestion(
                result.placeId,
                result.formattedAddress,
                eircode,
                result.formattedAddress,
                lat,
                lng
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeocodingResponse {
        public String status;
        public List<GeocodingResult> results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeocodingResult {
        @JsonProperty("place_id")
        public String placeId;

        @JsonProperty("formatted_address")
        public String formattedAddress;

        public Geometry geometry;

        public List<String> types;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Geometry {
        public Location location;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Location {
        public double lat;
        public double lng;
    }
}
