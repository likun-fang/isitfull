package com.ecoreturn.runner;

import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.service.RvmImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class DataImportRunner implements CommandLineRunner {

    private static final String IMPORT_RVMS_ARG = "--import-rvms=";

    private final RvmImportService rvmImportService;
    private final RvmMapper rvmMapper;

    @Value("${rvm.seed-file:/config/1.json}")
    private String seedFilePath;

    @Override
    public void run(String... args) throws Exception {
        boolean explicitImport = false;
        for (String arg : args) {
            if (arg.startsWith(IMPORT_RVMS_ARG)) {
                String filePath = arg.substring(IMPORT_RVMS_ARG.length());
                handleRvmImport(filePath);
                explicitImport = true;
            }
        }

        if (!explicitImport) {
            autoSeedIfEmpty();
        }
    }

    private void autoSeedIfEmpty() {
        List<Long> ids = rvmMapper.findAllIds();
        if (!ids.isEmpty()) {
            log.info("Database already has {} RVMs, skipping seed", ids.size());
            return;
        }

        File seedFile = new File(seedFilePath);
        if (!seedFile.exists()) {
            log.info("No seed file at {}, skipping auto-seed", seedFilePath);
            return;
        }

        log.info("Empty database detected, seeding from {}", seedFilePath);
        handleRvmImport(seedFilePath);
    }

    private void handleRvmImport(String filePath) {
        log.info("Starting RVM import from: {}", filePath);
        try {
            int count = rvmImportService.importFromJson(filePath);
            log.info("Successfully imported {} RVM records", count);
        } catch (Exception e) {
            log.error("RVM import failed: {}", e.getMessage(), e);
            throw new RuntimeException("RVM import failed", e);
        }
    }
}
