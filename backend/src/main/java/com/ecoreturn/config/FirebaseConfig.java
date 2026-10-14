package com.ecoreturn.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.service-account:}")
    private String serviceAccountPath;

    @PostConstruct
    public void init() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream stream = resolveStream();
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(stream))
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized from: {}", serviceAccountPath);
            }
        } catch (Exception e) {
            log.warn("Firebase not configured, social login disabled: {}", e.getMessage());
        }
    }

    private InputStream resolveStream() throws Exception {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            return new ClassPathResource("firebase-service-account.json").getInputStream();
        }
        String path = serviceAccountPath.replaceFirst("^file:", "");
        return new FileInputStream(path);
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("FirebaseAuth bean unavailable - Firebase not initialized");
            return null;
        }
        return FirebaseAuth.getInstance();
    }
}
