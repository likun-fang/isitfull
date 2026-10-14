package com.ecoreturn.config;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AbstractAuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.auth.InstancePrincipalsAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.oci.object-storage")
@ConditionalOnProperty(prefix = "app.oci.object-storage", name = "enabled", havingValue = "true")
@Data
@Slf4j
public class OciObjectStorageConfig {

    private boolean enabled;
    private String region;
    private String namespace;
    private String bucket;
    private String authType = "config_file";
    private String configFile;
    private String profile = "DEFAULT";

    @Bean
    public ObjectStorage objectStorage() {
        try {
            var provider = createAuthProvider();
            var client = ObjectStorageClient.builder().build(provider);
            try {
                client.setRegion(Region.fromRegionId(region));
            } catch (Exception e) {
                String endpoint = "https://objectstorage." + region + ".oraclecloud.com";
                log.warn("Unknown region id '{}', using endpoint {}", region, endpoint);
                client.setEndpoint(endpoint);
            }
            log.info("OCI Object Storage client initialized (auth={}, region={})", authType, region);
            return client;
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize OCI ObjectStorage client", e);
        }
    }

    private AbstractAuthenticationDetailsProvider createAuthProvider() throws Exception {
        if ("instance_principal".equals(authType)) {
            log.info("Using Instance Principal authentication");
            return InstancePrincipalsAuthenticationDetailsProvider.builder().build();
        }
        log.info("Using config file authentication: {}", configFile);
        var cfg = ConfigFileReader.parse(configFile, profile);
        return new ConfigFileAuthenticationDetailsProvider(cfg);
    }
}
