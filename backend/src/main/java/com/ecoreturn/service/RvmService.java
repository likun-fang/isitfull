package com.ecoreturn.service;

import com.ecoreturn.dto.RvmDto;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.RvmMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for RVM (Reverse Vending Machine) operations.
 * Provides nearby search functionality using Redis GEO with PostGIS fallback.
 */
@Service
@Slf4j
public class RvmService {

    public static final int MAX_RADIUS = 50000;
    public static final int MAX_LIMIT = 200;
    public static final int DEFAULT_RADIUS = 5000;
    public static final int DEFAULT_LIMIT = 50;

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private final RvmMapper rvmMapper;
    private final ReportMapper reportMapper;
    private final RvmCacheService cacheService;
    private final RvmGeoService geoService;

    public RvmService(RvmMapper rvmMapper, ReportMapper reportMapper,
                      RvmCacheService cacheService, RvmGeoService geoService) {
        this.rvmMapper = rvmMapper;
        this.reportMapper = reportMapper;
        this.cacheService = cacheService;
        this.geoService = geoService;
    }

    /**
     * Finds RVMs near a given location.
     * Uses Redis GEO cache first, falls back to PostGIS if cache miss.
     *
     * @param lat    latitude of the search center
     * @param lng    longitude of the search center
     * @param radius search radius in meters (capped at MAX_RADIUS)
     * @param limit  maximum number of results (capped at MAX_LIMIT)
     * @return list of RvmDto with distance information
     */
    public List<RvmDto> findNearby(double lat, double lng, Integer radius, Integer limit) {
        int effectiveRadius = applyRadiusLimit(radius);
        int effectiveLimit = applyLimitConstraint(limit);

        // Try Redis GEO first
        List<RvmDto> cached = geoService.findNearby(lat, lng, effectiveRadius, effectiveLimit);
        if (!cached.isEmpty()) {
            return cached;
        }

        // Fallback to PostGIS
        log.info("Redis GEO MISS: falling back to PostGIS for ({}, {}) radius {}m",
                lat, lng, effectiveRadius);
        List<Rvm> rvms = rvmMapper.findNearby(lat, lng, effectiveRadius, effectiveLimit);

        return rvms.stream()
                .map(rvm -> {
                    int distance = calculateDistanceMeters(lat, lng, rvm.getLatitude(), rvm.getLongitude());
                    return RvmDto.fromEntity(rvm, distance);
                })
                .collect(Collectors.toList());
    }

    /**
     * Finds all RVMs, using cache when available.
     *
     * @return list of all RvmDto
     */
    public List<RvmDto> findAll() {
        List<RvmDto> cached = cacheService.getAllRvms();
        if (!cached.isEmpty()) {
            return cached;
        }
        List<Rvm> rvms = rvmMapper.selectList(null);
        List<RvmDto> dtos = rvms.stream()
                .map(rvm -> RvmDto.fromEntity(rvm, null))
                .toList();
        cacheService.cacheAllRvms(dtos);
        return dtos;
    }

    /**
     * Finds an RVM by its ID with reporter info.
     *
     * @param id the RVM ID
     * @return Optional containing the RvmDto if found
     */
    public Optional<RvmDto> findById(Long id, Double lat, Double lng) {
        Rvm rvm = rvmMapper.selectById(id);
        if (rvm == null) {
            return Optional.empty();
        }
        Integer distance = null;
        if (lat != null && lng != null && rvm.getLatitude() != null && rvm.getLongitude() != null) {
            distance = calculateDistanceMeters(lat, lng, rvm.getLatitude(), rvm.getLongitude());
        }
        RvmDto dto = RvmDto.fromEntity(rvm, distance);
        enrichWithReporterInfo(dto);
        return Optional.of(dto);
    }

    /**
     * Finds RVMs by a list of IDs with optional distance calculation.
     */
    public List<RvmDto> findByIds(List<Long> ids, Double lat, Double lng) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> capped = ids.size() > DEFAULT_LIMIT ? ids.subList(0, DEFAULT_LIMIT) : ids;
        List<Rvm> rvms = rvmMapper.selectBatchIds(capped);
        return rvms.stream()
                .map(rvm -> {
                    Integer distance = null;
                    if (lat != null && lng != null && rvm.getLatitude() != null && rvm.getLongitude() != null) {
                        distance = calculateDistanceMeters(lat, lng, rvm.getLatitude(), rvm.getLongitude());
                    }
                    return RvmDto.fromEntity(rvm, distance);
                })
                .collect(Collectors.toList());
    }

    /**
     * Finds an RVM entity by its ID.
     *
     * @param id the RVM ID
     * @return the Rvm entity if found, null otherwise
     */
    public Rvm findEntityById(Long id) {
        return rvmMapper.selectById(id);
    }

    /**
     * Applies the radius limit constraint.
     *
     * @param radius the requested radius
     * @return the effective radius (capped at MAX_RADIUS, defaults to DEFAULT_RADIUS)
     */
    private int applyRadiusLimit(Integer radius) {
        if (radius == null || radius <= 0) {
            return DEFAULT_RADIUS;
        }
        return Math.min(radius, MAX_RADIUS);
    }

    /**
     * Applies the limit constraint.
     *
     * @param limit the requested limit
     * @return the effective limit (capped at MAX_LIMIT, defaults to DEFAULT_LIMIT)
     */
    private int applyLimitConstraint(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    /**
     * Calculates the distance between two points using the Haversine formula.
     *
     * @param lat1 latitude of point 1
     * @param lng1 longitude of point 1
     * @param lat2 latitude of point 2
     * @param lng2 longitude of point 2
     * @return distance in meters
     */
    private int calculateDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (int) Math.round(EARTH_RADIUS_METERS * c);
    }

    /**
     * Enriches RvmDto with last reporter information.
     */
    private void enrichWithReporterInfo(RvmDto dto) {
        var reporterInfo = reportMapper.findLatestReportWithReporter(dto.getId());
        if (reporterInfo != null && reporterInfo.getReporterName() != null) {
            dto.setReporterInfo(
                reporterInfo.getReporterName(),
                reporterInfo.getReporterKarma() != null ? reporterInfo.getReporterKarma() : 0
            );
        }
    }
}
