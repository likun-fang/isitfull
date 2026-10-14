package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.SearchSuggestion;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/suggestions")
    @RateLimit(rate = 120, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<List<SearchSuggestion>>> getSuggestions(
            @RequestParam String q,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String sessionToken) {

        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BAD_REQUEST", "Query parameter 'q' is required"));
        }

        List<SearchSuggestion> suggestions = searchService.search(q.trim(), lat, lng);
        ApiResponse.Meta meta = new ApiResponse.Meta(suggestions.size(), null);
        return ResponseEntity.ok(ApiResponse.success(suggestions, meta));
    }
}
