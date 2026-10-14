package com.ecoreturn.controller;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.enums.RateLimitType;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class PublicEndpointRateLimitTest {

    static Stream<Arguments> publicReadEndpoints() {
        return Stream.of(
                Arguments.of(RvmController.class, "getAllRvms", 300),
                Arguments.of(RvmController.class, "findNearby", 600),
                Arguments.of(RvmController.class, "findByIds", 300),
                Arguments.of(RvmController.class, "findById", 600),
                Arguments.of(StatsController.class, "getDashboardStats", 120),
                Arguments.of(UserController.class, "getTopContributors", 120));
    }

    @ParameterizedTest(name = "{1} allows {2} requests per minute per IP")
    @MethodSource("publicReadEndpoints")
    void publicReadEndpoint_isRateLimitedPerIp(Class<?> controller, String methodName, int requestsPerMinute) {
        RateLimit rateLimit = findMethod(controller, methodName).getAnnotation(RateLimit.class);

        assertThat(rateLimit).as("@RateLimit on %s.%s", controller.getSimpleName(), methodName).isNotNull();
        assertThat(rateLimit.limitType()).isEqualTo(RateLimitType.IP);
        assertThat(rateLimit.rate()).isEqualTo(requestsPerMinute);
        assertThat(rateLimit.rateInterval()).isEqualTo(60);
    }

    private static Method findMethod(Class<?> controller, String methodName) {
        return Arrays.stream(controller.getDeclaredMethods())
                .filter(method -> method.getName().equals(methodName))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No method " + methodName + " on " + controller.getSimpleName()));
    }
}
