package com.ecoreturn;

import com.ecoreturn.config.AppProperties;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Eco-Return Ireland backend.
 * Provides the entry point for the Spring Boot application.
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties(AppProperties.class)
@MapperScan("com.ecoreturn.mapper")
public class EcoReturnApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoReturnApplication.class, args);
    }
}
