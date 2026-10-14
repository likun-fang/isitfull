package com.ecoreturn.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .alwaysExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .build();
    }

    @Test
    void unexpectedException_returnsGeneric500WithoutDetails() throws Exception {
        mockMvc.perform(get("/test/failure"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(content().string(not(containsString("jdbc:postgresql"))));
    }

    @Test
    void missingRequestParameter_returns400InTheApiEnvelope() throws Exception {
        mockMvc.perform(get("/test/number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("Required parameter 'value' is not present."));
    }

    @Test
    void wrongParameterType_returns400InTheApiEnvelope() throws Exception {
        mockMvc.perform(get("/test/number").param("value", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"));
    }

    @Test
    void unknownPath_returns404InTheApiEnvelope() throws Exception {
        mockMvc.perform(get("/test/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void wrongHttpMethod_returns405InTheApiEnvelope() throws Exception {
        mockMvc.perform(delete("/test/number"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("METHOD_NOT_ALLOWED"))
                .andExpect(jsonPath("$.message").value("Method 'DELETE' is not supported."));
    }

    @Test
    void invalidRequestBody_returns400NamingTheInvalidField() throws Exception {
        mockMvc.perform(post("/test/validated")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"deviceId\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("deviceId: must not be blank"));
    }

    @Test
    void malformedJsonBody_returns400InTheApiEnvelope() throws Exception {
        mockMvc.perform(post("/test/body")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("Failed to read request"));
    }

    @Test
    void unexpectedException_returnsJsonEvenWhenXmlIsRequested() throws Exception {
        mockMvc.perform(get("/test/failure").accept(MediaType.APPLICATION_XML))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("INTERNAL_ERROR"));
    }

    @Test
    void wrongHttpMethod_preservesAllowHeaderAndReturnsJsonWhenXmlIsRequested() throws Exception {
        mockMvc.perform(delete("/test/number").accept(MediaType.APPLICATION_XML))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", containsString("GET")))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void successfulNumberRequest_returns406WhenOnlyXmlIsAccepted() throws Exception {
        mockMvc.perform(get("/test/number").param("value", "42")
                        .accept(MediaType.APPLICATION_XML))
                .andExpect(status().isNotAcceptable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("NOT_ACCEPTABLE"));
    }

    @RestController
    @RequestMapping("/test")
    static class TestController {

        @GetMapping("/failure")
        String failure() {
            throw new RuntimeException("Connection to jdbc:postgresql://db:5432/eco_return refused");
        }

        @GetMapping("/number")
        int number(@RequestParam int value) {
            return value;
        }

        @PostMapping("/body")
        String body(@RequestBody Map<String, String> body) {
            return "ok";
        }

        @PostMapping("/validated")
        String validated(@Valid @RequestBody DeviceRequest request) {
            return "ok";
        }
    }

    // The message is set explicitly so the test does not depend on the JVM's locale.
    record DeviceRequest(@NotBlank(message = "must not be blank") String deviceId) {
    }
}
