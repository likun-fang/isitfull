package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.RvmDto;
import com.ecoreturn.enums.RateLimitType;
import com.ecoreturn.service.RvmService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * REST controller for RVM (Reverse Vending Machine) endpoints.
 * Provides nearby search and individual RVM lookup functionality.
 */
@RestController
@RequestMapping("/api/v1/rvms")
public class RvmController {

    private final RvmService rvmService;

    public RvmController(RvmService rvmService) {
        this.rvmService = rvmService;
    }

    /**
     * Gets all RVMs (cached).
     *
     * @return ApiResponse containing list of all RvmDto
     */
    // Per-IP limits on the public read endpoints are generous on purpose: Irish mobile networks
    // (Three, Vodafone, eir) put many users behind one carrier-grade NAT address, and a single
    // map pan fires several /nearby calls per user.
    @GetMapping("/all")
    @RateLimit(rate = 300, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<List<RvmDto>>> getAllRvms() {
        List<RvmDto> rvms = rvmService.findAll();
        ApiResponse.Meta meta = new ApiResponse.Meta(rvms.size(), null);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).mustRevalidate())
            .body(ApiResponse.success(rvms, meta));
    }

    /**
     * Finds RVMs near a given location.
     *
     * @param lat    latitude of the search center (required)
     * @param lng    longitude of the search center (required)
     * @param radius search radius in meters (optional, default 5000, max 50000)
     * @param limit  maximum number of results (optional, default 50, max 200)
     * @return ApiResponse containing list of RvmDto with meta information
     */
    @GetMapping("/nearby")
    @RateLimit(rate = 600, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<List<RvmDto>>> findNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Integer radius,
            @RequestParam(required = false) Integer limit) {

        int effectiveRadius = resolveRadius(radius);
        List<RvmDto> rvms = rvmService.findNearby(lat, lng, radius, limit);

        ApiResponse.Meta meta = new ApiResponse.Meta(rvms.size(), effectiveRadius);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).mustRevalidate())
            .body(ApiResponse.success(rvms, meta));
    }

    @GetMapping("/batch")
    @RateLimit(rate = 300, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<List<RvmDto>>> findByIds(
            @RequestParam List<Long> ids,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        List<RvmDto> rvms = rvmService.findByIds(ids, lat, lng);
        return ResponseEntity.ok(ApiResponse.success(rvms));
    }

    /**
     * Finds an RVM by its ID.
     *
     * @param id the RVM ID
     * @return ApiResponse containing the RvmDto if found, or error response
     */
    @GetMapping("/{id}")
    @RateLimit(rate = 600, rateInterval = 60, limitType = RateLimitType.IP)
    public ResponseEntity<ApiResponse<RvmDto>> findById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return rvmService.findById(id, lat, lng)
                .map(rvm -> ResponseEntity.ok(ApiResponse.success(rvm)))
                .orElseGet(() -> ResponseEntity
                        .status(404)
                        .body(ApiResponse.error("NOT_FOUND", "RVM not found with id: " + id)));
    }

    /**
     * Resolves the effective radius value for meta information.
     *
     * @param radius the requested radius
     * @return the effective radius value
     */
    private int resolveRadius(Integer radius) {
        if (radius == null || radius <= 0) {
            return RvmService.DEFAULT_RADIUS;
        }
        return Math.min(radius, RvmService.MAX_RADIUS);
    }
}
