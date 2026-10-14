package com.ecoreturn.client;

import com.ecoreturn.dto.RvmImportDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReturnApiClient {

    private static final String API_URL =
        "https://re-turn.ie/wp-admin/admin-ajax.php"
        + "?action=asl_load_stores&nonce=&load_all=1&layout=1&category=18";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public List<RvmImportDto> fetchAllRvms() {
        try {
            String response = restTemplate.getForObject(API_URL, String.class);
            if (response == null || response.isBlank()) {
                log.error("Empty response from Re-turn API");
                return Collections.emptyList();
            }

            List<RvmImportDto> rvms = objectMapper.readValue(
                response, new TypeReference<>() {}
            );
            log.info("Fetched {} RVMs from Re-turn API", rvms.size());
            return rvms;
        } catch (Exception e) {
            log.error("Failed to fetch RVMs from Re-turn API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
