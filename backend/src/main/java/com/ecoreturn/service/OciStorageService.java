package com.ecoreturn.service;

import com.ecoreturn.config.OciObjectStorageConfig;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnBean(OciObjectStorageConfig.class)
@RequiredArgsConstructor
@Slf4j
public class OciStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final int HEADER_LENGTH = 4;

    private final ObjectStorage objectStorage;
    private final OciObjectStorageConfig config;

    public String uploadScreenshot(MultipartFile file) {
        validateFile(file);

        String ext = getExtension(file.getContentType());
        String objectName = "feedback/" + UUID.randomUUID() + ext;

        try (var inputStream = file.getInputStream()) {
            var request = PutObjectRequest.builder()
                    .namespaceName(config.getNamespace())
                    .bucketName(config.getBucket())
                    .objectName(objectName)
                    .contentLength(file.getSize())
                    .contentType(file.getContentType())
                    .putObjectBody(inputStream)
                    .build();

            var response = objectStorage.putObject(request);
            if (response.get__httpStatusCode__() / 100 != 2) {
                throw new RuntimeException("OCI upload failed with status: "
                        + response.get__httpStatusCode__());
            }

            String url = buildPublicUrl(objectName);
            log.info("Screenshot uploaded to OCI: {}", url);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read screenshot file", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Screenshot file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Screenshot file exceeds 5MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG and PNG images are allowed");
        }
        // The client sets the Content-Type, so also check that the file starts like that image type
        byte[] header = readHeader(file);
        if (header.length < HEADER_LENGTH) {
            throw new IllegalArgumentException("File too small to be a valid image");
        }
        if (!matchesMagicBytes(header, file.getContentType())) {
            throw new IllegalArgumentException("File content does not match declared type");
        }
    }

    private byte[] readHeader(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return inputStream.readNBytes(HEADER_LENGTH);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read screenshot file", e);
        }
    }

    private boolean matchesMagicBytes(byte[] header, String contentType) {
        byte[] magic = "image/png".equals(contentType) ? PNG_MAGIC : JPEG_MAGIC;
        return Arrays.equals(header, 0, magic.length, magic, 0, magic.length);
    }

    private String getExtension(String contentType) {
        return "image/png".equals(contentType) ? ".png" : ".jpg";
    }

    private String buildPublicUrl(String objectName) {
        String encoded = URLEncoder.encode(objectName, StandardCharsets.UTF_8)
                .replace("+", "%20");
        return String.format("https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
                config.getRegion(), config.getNamespace(), config.getBucket(), encoded);
    }
}
