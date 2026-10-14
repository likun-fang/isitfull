package com.ecoreturn.client;

import com.ecoreturn.config.AppProperties;
import com.ecoreturn.dto.SearchSuggestion;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;

@Component
public class LocationIqClient {

    private static final Logger log = LoggerFactory.getLogger(LocationIqClient.class);
    private static final String AUTOCOMPLETE_URL = "https://eu1.locationiq.com/v1/autocomplete";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public LocationIqClient(RestTemplate restTemplate, AppProperties appProperties) {
        this.restTemplate = restTemplate;
        this.apiKey = appProperties.locationIq().apiKey();
    }

    public List<SearchSuggestion> autocomplete(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        // Build URI object to prevent double encoding by RestTemplate
        URI uri = UriComponentsBuilder.fromHttpUrl(AUTOCOMPLETE_URL)
                .queryParam("key", apiKey)
                .queryParam("q", query)
                .queryParam("countrycodes", "ie")
                .queryParam("limit", 5)
                .queryParam("dedupe", 1)
                .queryParam("normalizecity", 1)
                .build()
                .toUri();

        try {
            log.info("Calling LocationIQ API for query: {}", query);
            LocationIqResponse[] responses = restTemplate.getForObject(uri, LocationIqResponse[].class);
            if (responses == null) {
                log.warn("LocationIQ returned null for query: {}", query);
                return Collections.emptyList();
            }
            log.info("LocationIQ returned {} results for query: {}", responses.length, query);
            if (responses.length > 0) {
                log.info("First result - lat: {}, lon: {}, displayName: {}",
                        responses[0].lat, responses[0].lon, responses[0].displayName);
            }
            return java.util.Arrays.stream(responses)
                    .map(this::toSearchSuggestion)
                    .toList();
        } catch (HttpClientErrorException.NotFound e) {
            // 404 is normal when user is typing partial Eircode or invalid query
            log.info("LocationIQ found nothing for query: '{}', returning empty list", query);
            return Collections.emptyList();
        } catch (RestClientException e) {
            // Other errors (timeout, 500, etc.) are real problems
            log.error("LocationIQ autocomplete failed for query: {}", query, e);
            return Collections.emptyList();
        }
    }

    private SearchSuggestion toSearchSuggestion(LocationIqResponse response) {
        String mainText = response.address != null ? response.address.name : response.displayName;
        String secondaryText = buildSecondaryText(response);

        return new SearchSuggestion(
                response.placeId,
                response.displayName,
                mainText != null ? mainText : response.displayName,
                secondaryText,
                parseDouble(response.lat),
                parseDouble(response.lon)
        );
    }

    private String buildSecondaryText(LocationIqResponse response) {
        if (response.address == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        if (response.address.road != null) {
            sb.append(response.address.road);
        }
        if (response.address.city != null) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(response.address.city);
        }
        if (response.address.county != null) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(response.address.county);
        }
        return sb.toString();
    }

    private double parseDouble(String value) {
        try {
            return value != null ? Double.parseDouble(value) : 0.0;
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LocationIqResponse {
        @JsonProperty("place_id")
        public String placeId;

        @JsonProperty("display_name")
        public String displayName;

        public String lat;
        public String lon;
        public LocationIqAddress address;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LocationIqAddress {
        public String name;
        public String road;
        public String city;
        public String county;
    }
}
