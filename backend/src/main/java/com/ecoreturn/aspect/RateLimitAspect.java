package com.ecoreturn.aspect;

import com.ecoreturn.annotation.RateLimit;
import com.ecoreturn.exception.RateLimitException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.Duration;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitAspect {

    private final RedissonClient redissonClient;

    @Before("@annotation(rateLimit)")
    public void doBefore(JoinPoint joinPoint, RateLimit rateLimit) {
        String key = generateRateLimitKey(joinPoint, rateLimit);

        RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);
        rateLimiter.expire(Duration.ofHours(1));
        // setRate also deletes the requests counted so far, so calling it here reset the
        // limiter on every request. trySetRate writes the config only when the key has none;
        // a changed limit applies once the key has been idle for the hour above.
        rateLimiter.trySetRate(
            RateType.OVERALL,
            rateLimit.rate(),
            rateLimit.rateInterval(),
            RateIntervalUnit.SECONDS
        );

        if (!rateLimiter.tryAcquire(1)) {
            throw new RateLimitException(rateLimit.message(), rateLimit.rateInterval());
        }
    }

    private String generateRateLimitKey(JoinPoint point, RateLimit rateLimit) {
        StringBuilder keyBuilder = new StringBuilder("rate_limit:");

        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        String methodKey = method.getDeclaringClass().getSimpleName() + "." + method.getName();

        if (!rateLimit.key().isEmpty()) {
            keyBuilder.append(rateLimit.key()).append(":");
        }

        switch (rateLimit.limitType()) {
            case API -> keyBuilder.append("api:").append(methodKey);
            case USER -> keyBuilder.append(methodKey).append(":").append(resolveIdentity());
            case IP -> keyBuilder.append(methodKey).append(":ip:").append(getClientIP());
        }
        return keyBuilder.toString();
    }

    private String resolveIdentity() {
        // Level 1: User ID (future)
        String userId = getHeader("X-User-ID");
        if (isValid(userId)) {
            return "user:" + userId;
        }

        // Level 2: Device ID
        String deviceId = getHeader("X-Device-ID");
        if (isValid(deviceId)) {
            return "device:" + deviceId;
        }

        // Level 3: IP fallback
        return "ip:" + getClientIP();
    }

    private boolean isValid(String str) {
        return str != null && !str.isEmpty() && !"unknown".equalsIgnoreCase(str);
    }

    private String getHeader(String name) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) return "unknown";
        String value = attributes.getRequest().getHeader(name);
        return (value != null && !value.isEmpty()) ? value : "unknown";
    }

    private String getClientIP() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) return "unknown";

        HttpServletRequest request = attributes.getRequest();
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "unknown";
    }
}
