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
import java.util.Collections;
import java.util.List;

@Component
public class MapboxSearchClient {

    private static final Logger log = LoggerFactory.getLogger(MapboxSearchClient.class);
    private static final String FORWARD_URL = "https://api.mapbox.com/search/searchbox/v1/forward";

    private final RestTemplate restTemplate;
    private final String accessToken;

    public MapboxSearchClient(RestTemplate restTemplate, AppProperties appProperties) {
        this.restTemplate = restTemplate;
        this.accessToken = appProperties.mapbox().accessToken();
    }

    public List<SearchSuggestion> forward(String query, Double lat, Double lng) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(FORWARD_URL)
                .queryParam("q", query)
                .queryParam("access_token", accessToken)
                .queryParam("country", "ie")
                .queryParam("language", "en")
                .queryParam("limit", 5)
                .queryParam("types", "place,locality,neighborhood,address,street,poi")
                .queryParam("auto_complete", true);

        if (lat != null && lng != null) {
            builder.queryParam("proximity", lng + "," + lat);
        }

        URI uri = builder.build().toUri();

        try {
            log.info("Calling Mapbox API for query: {}", query);
            MapboxResponse response = restTemplate.getForObject(uri, MapboxResponse.class);
            if (response == null || response.features == null) {
                log.warn("Mapbox returned null for query: {}", query);
                return Collections.emptyList();
            }
            log.info("Mapbox returned {} results for query: {}", response.features.size(), query);
            return response.features.stream()
                    .map(this::toSearchSuggestion)
                    .toList();
        } catch (RestClientException e) {
            log.error("Mapbox forward failed for query: {}", query, e);
            return Collections.emptyList();
        }
    }

    private SearchSuggestion toSearchSuggestion(MapboxFeature feature) {
        MapboxProperties props = feature.properties != null ? feature.properties : new MapboxProperties();
        double[] coords = feature.geometry != null && feature.geometry.coordinates != null
                ? feature.geometry.coordinates : new double[]{0.0, 0.0};

        String displayName = props.fullAddress != null ? props.fullAddress : props.placeFormatted;
        String mainText = props.name != null ? props.name : displayName;
        String secondaryText = props.placeFormatted != null ? props.placeFormatted : "";

        return new SearchSuggestion(
                props.mapboxId != null ? props.mapboxId : "",
                displayName != null ? displayName : "",
                mainText,
                secondaryText,
                coords.length > 1 ? coords[1] : 0.0,
                coords.length > 0 ? coords[0] : 0.0
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MapboxResponse {
        public List<MapboxFeature> features;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MapboxFeature {
        public MapboxProperties properties;
        public MapboxGeometry geometry;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MapboxProperties {
        @JsonProperty("mapbox_id")
        public String mapboxId;
        public String name;
        @JsonProperty("full_address")
        public String fullAddress;
        @JsonProperty("place_formatted")
        public String placeFormatted;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MapboxGeometry {
        public double[] coordinates;
    }
}
