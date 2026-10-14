package com.ecoreturn.service;

import com.ecoreturn.client.GoogleGeocodingClient;
import com.ecoreturn.client.LocationIqClient;
import com.ecoreturn.dto.SearchSuggestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private static final Pattern EIRCODE_PATTERN = Pattern.compile("^[A-Z][0-9][0-9A-Z]\\s?[A-Z0-9]{4}$", Pattern.CASE_INSENSITIVE);
    private static final String CACHE_PREFIX_EIRCODE = "search:eircode:";
    private static final String CACHE_PREFIX_ADDRESS = "search:address:";
    private static final Duration EIRCODE_TTL = Duration.ofDays(30);
    private static final Duration ADDRESS_TTL = Duration.ofDays(1);
    private static final int MAX_CACHE_KEY_LENGTH = 100;

    private final LocationIqClient locationIqClient;
    private final GoogleGeocodingClient googleGeocodingClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public SearchService(
            LocationIqClient locationIqClient,
            GoogleGeocodingClient googleGeocodingClient,
            RedisTemplate<String, Object> redisTemplate
    ) {
        this.locationIqClient = locationIqClient;
        this.googleGeocodingClient = googleGeocodingClient;
        this.redisTemplate = redisTemplate;
    }

    public List<SearchSuggestion> search(String query, Double lat, Double lng) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String normalizedQuery = query.trim();

        if (isFullEircode(normalizedQuery)) {
            log.info("Detected full Eircode: {}", normalizedQuery);
            return searchEircode(normalizedQuery);
        }

        return searchAddress(normalizedQuery);
    }

    private boolean isFullEircode(String query) {
        return EIRCODE_PATTERN.matcher(query).matches();
    }

    @SuppressWarnings("unchecked")
    private List<SearchSuggestion> searchEircode(String eircode) {
        String cacheKey = CACHE_PREFIX_EIRCODE + eircode.toUpperCase().replaceAll("\\s+", "");

        List<SearchSuggestion> cached = (List<SearchSuggestion>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Cache HIT for Eircode: {}, returning {} results", eircode, cached.size());
            return cached;
        }

        log.info("Cache MISS for Eircode: {}, calling Google Geocoding API", eircode);
        Optional<SearchSuggestion> result = googleGeocodingClient.geocodeEircode(eircode);
        List<SearchSuggestion> suggestions = result.map(List::of).orElse(Collections.emptyList());

        if (!suggestions.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, suggestions, EIRCODE_TTL);
            log.info("Cached Eircode result: {} -> {} results", eircode, suggestions.size());
        } else {
            log.info("Google returned no results for Eircode: {}", eircode);
        }

        return suggestions;
    }

    @SuppressWarnings("unchecked")
    private List<SearchSuggestion> searchAddress(String query) {
        String normalized = query.toLowerCase();
        if (normalized.length() > MAX_CACHE_KEY_LENGTH) {
            normalized = normalized.substring(0, MAX_CACHE_KEY_LENGTH);
        }
        String cacheKey = CACHE_PREFIX_ADDRESS + normalized.replaceAll("\\s+", "_");

        List<SearchSuggestion> cached = (List<SearchSuggestion>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.debug("Cache hit for address: {}", query);
            return cached;
        }

        List<SearchSuggestion> suggestions = locationIqClient.autocomplete(query);

        if (!suggestions.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, suggestions, ADDRESS_TTL);
        }

        return suggestions;
    }
}
