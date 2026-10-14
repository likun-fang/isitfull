package com.ecoreturn.service;

import com.ecoreturn.dto.RvmImportDto;
import com.ecoreturn.dto.RvmSyncResult;
import com.ecoreturn.mapper.RvmMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RvmImportService {

    private static final Logger logger = LoggerFactory.getLogger(RvmImportService.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final RvmMapper rvmMapper;

    private static final String UPSERT_SQL = """
        INSERT INTO rvm (external_id, name, city, postal_code, latitude, longitude, location, open_hours, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?::jsonb, 'UNKNOWN', NOW())
        ON CONFLICT (external_id) DO UPDATE SET
            name = EXCLUDED.name,
            city = EXCLUDED.city,
            postal_code = EXCLUDED.postal_code,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            location = EXCLUDED.location,
            open_hours = EXCLUDED.open_hours
        """;

    public RvmImportService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper, RvmMapper rvmMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.rvmMapper = rvmMapper;
    }

    public int importFromJson(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new IOException("Import file not found: " + filePath);
        }

        List<RvmImportDto> rvmList = objectMapper.readValue(
            file,
            new TypeReference<List<RvmImportDto>>() {}
        );

        logger.info("Starting import of {} RVM records from {}", rvmList.size(), filePath);
        return upsertAll(rvmList);
    }

    public RvmSyncResult importFromList(List<RvmImportDto> rvmList) {
        logger.info("Starting sync of {} RVM records from API", rvmList.size());

        Set<String> existingIds = new HashSet<>(rvmMapper.findAllExternalIds());
        Set<String> incomingIds = rvmList.stream()
                .map(RvmImportDto::getId)
                .collect(Collectors.toSet());

        List<String> newRvmNames = rvmList.stream()
                .filter(r -> !existingIds.contains(r.getId()))
                .map(RvmImportDto::getTitle)
                .toList();

        List<String> removedIds = existingIds.stream()
                .filter(id -> !incomingIds.contains(id))
                .toList();

        if (!newRvmNames.isEmpty()) {
            logger.info("New RVMs from API ({}): {}", newRvmNames.size(), newRvmNames);
        }
        if (!removedIds.isEmpty()) {
            logger.warn("RVMs no longer in API ({}) external_ids: {}", removedIds.size(), removedIds);
        }

        int upserted = upsertAll(rvmList);

        return RvmSyncResult.builder()
                .fetched(rvmList.size())
                .upserted(upserted)
                .newCount(newRvmNames.size())
                .removedCount(removedIds.size())
                .newRvmNames(newRvmNames)
                .removedExternalIds(removedIds)
                .build();
    }

    private int upsertAll(List<RvmImportDto> rvmList) {
        List<RvmImportDto> valid = new ArrayList<>();
        int skipped = 0;

        for (RvmImportDto rvm : rvmList) {
            Double lat = parseCoordinate(rvm.getLat());
            Double lng = parseCoordinate(rvm.getLng());
            if (lat == null || lng == null) {
                logger.warn("Skipping RVM {} - invalid coordinates: lat={}, lng={}",
                    rvm.getId(), rvm.getLat(), rvm.getLng());
                skipped++;
                continue;
            }
            valid.add(rvm);
        }

        if (valid.isEmpty()) {
            logger.warn("No valid RVM records to import");
            return 0;
        }

        int[] results = jdbcTemplate.batchUpdate(UPSERT_SQL, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                RvmImportDto rvm = valid.get(i);
                double lat = Double.parseDouble(rvm.getLat().trim());
                double lng = Double.parseDouble(rvm.getLng().trim());
                ps.setString(1, rvm.getId());
                ps.setString(2, rvm.getTitle());
                ps.setString(3, rvm.getCity());
                ps.setString(4, rvm.getPostalCode());
                ps.setDouble(5, lat);
                ps.setDouble(6, lng);
                ps.setDouble(7, lng);
                ps.setDouble(8, lat);
                ps.setString(9, rvm.getOpenHours());
            }

            @Override
            public int getBatchSize() {
                return valid.size();
            }
        });

        int successCount = results.length;
        logger.info("Import completed: {} successful, {} skipped (invalid coordinates)", successCount, skipped);
        return successCount;
    }

    private Double parseCoordinate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
