package com.ecoreturn.service;

import com.ecoreturn.dto.RvmDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RvmCacheServiceTest {

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RvmCacheService cacheService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        cacheService = new RvmCacheService(valueOperations, objectMapper);
    }

    @Test
    void getAllRvms_whenCacheHit_returnsFromCache() {
        String cachedJson = "[{\"id\":1,\"name\":\"Tesco\",\"lat\":53.0,\"lng\":-6.0}]";
        when(valueOperations.get("rvm:all")).thenReturn(cachedJson);

        List<RvmDto> result = cacheService.getAllRvms();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tesco");
    }

    @Test
    void getAllRvms_whenCacheMiss_returnsEmptyList() {
        when(valueOperations.get("rvm:all")).thenReturn(null);

        List<RvmDto> result = cacheService.getAllRvms();

        assertThat(result).isEmpty();
    }
}
