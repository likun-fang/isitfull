package com.ecoreturn.service;

import com.ecoreturn.config.OciObjectStorageConfig;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.oracle.bmc.objectstorage.responses.PutObjectResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.lang.reflect.Proxy;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OciStorageServiceTest {

    private static final byte[] JPEG_BYTES = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10};
    private static final byte[] PNG_BYTES = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    private final List<PutObjectRequest> uploads = new ArrayList<>();
    private OciStorageService service;

    @BeforeEach
    void setUp() {
        OciObjectStorageConfig config = new OciObjectStorageConfig();
        config.setRegion("eu-amsterdam-1");
        config.setNamespace("test-namespace");
        config.setBucket("test-bucket");
        service = new OciStorageService(recordingObjectStorage(), config);
    }

    @Test
    void jpegContentType_withPngBytes_isRejected() {
        MockMultipartFile file = new MockMultipartFile("screenshot", "shot.jpg", "image/jpeg", PNG_BYTES);

        assertThatThrownBy(() -> service.uploadScreenshot(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File content does not match declared type");
        assertThat(uploads).isEmpty();
    }

    @Test
    void pngContentType_withNonImageBytes_isRejected() {
        byte[] script = "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile("screenshot", "shot.png", "image/png", script);

        assertThatThrownBy(() -> service.uploadScreenshot(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File content does not match declared type");
        assertThat(uploads).isEmpty();
    }

    @Test
    void fileShorterThanAnImageHeader_isRejected() {
        MockMultipartFile file = new MockMultipartFile(
                "screenshot", "shot.jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8});

        assertThatThrownBy(() -> service.uploadScreenshot(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File too small to be a valid image");
        assertThat(uploads).isEmpty();
    }

    @Test
    void jpegContentType_withJpegBytes_isUploaded() {
        MockMultipartFile file = new MockMultipartFile("screenshot", "shot.jpg", "image/jpeg", JPEG_BYTES);

        String url = service.uploadScreenshot(file);

        assertThat(uploads).singleElement()
                .satisfies(request -> assertThat(request.getContentType()).isEqualTo("image/jpeg"));
        assertThat(url)
                .startsWith("https://objectstorage.eu-amsterdam-1.oraclecloud.com/n/test-namespace/b/test-bucket/o/feedback%2F")
                .endsWith(".jpg");
    }

    // A plain proxy instead of a Mockito mock: ObjectStorage extends java.lang.AutoCloseable,
    // and the Byte Buddy version Spring Boot 3.2 ships cannot rewrite JDK classes newer than Java 22.
    private ObjectStorage recordingObjectStorage() {
        return (ObjectStorage) Proxy.newProxyInstance(
                ObjectStorage.class.getClassLoader(),
                new Class<?>[]{ObjectStorage.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("putObject")) {
                        uploads.add((PutObjectRequest) args[0]);
                        return PutObjectResponse.builder().__httpStatusCode__(200).build();
                    }
                    throw new UnsupportedOperationException(method.getName());
                });
    }
}
