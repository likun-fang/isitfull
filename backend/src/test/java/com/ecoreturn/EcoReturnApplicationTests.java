package com.ecoreturn;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

/**
 * Basic test to verify the application class exists and can be instantiated.
 */
class EcoReturnApplicationTests {

    @Test
    void applicationClassExists() {
        assertDoesNotThrow(() -> {
            EcoReturnApplication app = new EcoReturnApplication();
        });
    }

    @Test
    void mainMethodExists() {
        assertDoesNotThrow(() -> {
            EcoReturnApplication.class.getMethod("main", String[].class);
        });
    }
}
