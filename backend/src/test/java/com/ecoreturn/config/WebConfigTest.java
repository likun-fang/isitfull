package com.ecoreturn.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class WebConfigTest {

    private static final String CONFIGURED_ORIGINS = "https://isitfull.ie, https://www.isitfull.ie";

    @Test
    void prodProfile_allowsOnlyConfiguredOrigins() {
        List<String> origins = allowedOrigins("prod");

        assertThat(origins).containsExactly("https://isitfull.ie", "https://www.isitfull.ie");
    }

    @Test
    void localProfile_alsoAllowsLocalhostOrigins() {
        List<String> origins = allowedOrigins("local");

        assertThat(origins).containsExactlyInAnyOrder(
                "https://isitfull.ie",
                "https://www.isitfull.ie",
                "http://localhost:8081",
                "http://localhost:19006",
                "http://localhost:3000",
                "exp://localhost:8081");
    }

    private List<String> allowedOrigins(String activeProfile) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(activeProfile);
        InspectableCorsRegistry registry = new InspectableCorsRegistry();

        new WebConfig(CONFIGURED_ORIGINS, environment).addCorsMappings(registry);

        return registry.getCorsConfigurations().get("/api/**").getAllowedOrigins();
    }

    // CorsRegistry keeps the registered configurations protected; this exposes them to the test.
    private static class InspectableCorsRegistry extends CorsRegistry {
        @Override
        public Map<String, CorsConfiguration> getCorsConfigurations() {
            return super.getCorsConfigurations();
        }
    }
}
