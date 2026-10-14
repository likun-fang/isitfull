package com.ecoreturn.exception;

import com.ecoreturn.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

// Extends ResponseEntityExceptionHandler so Spring MVC's own exceptions (missing parameter,
// malformed body, unknown path, wrong method, ...) keep their 4xx status instead of reaching
// the catch-all below.
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("BAD_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorizedException(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("UNAUTHORIZED", e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbiddenException(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("FORBIDDEN", e.getMessage()));
    }

    @ExceptionHandler(GeofenceException.class)
    public ResponseEntity<ApiResponse<Void>> handleGeofenceException(GeofenceException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("GEOFENCE_FAILED", e.getMessage()));
    }

    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitException(RateLimitException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "RATE_LIMITED");
        response.put("message", e.getMessage());
        response.put("retryAfterSeconds", e.getRetryAfterSeconds());

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error("CONFLICT", e.getMessage()));
    }

    // Anything unexpected may carry internal details (SQL, hostnames, stack traces),
    // so they go to the log and the client gets a generic message.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "An unexpected error occurred"));
    }

    // Spring MVC's own errors keep the status and headers Spring chose, but are answered in this
    // API's ApiResponse envelope instead of Spring's ProblemDetail body.
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception e, Object body, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ResponseEntity<Object> standard = super.handleExceptionInternal(e, body, headers, status, request);
        if (standard == null) {
            return null; // the response was already committed
        }
        HttpStatus httpStatus = HttpStatus.valueOf(standard.getStatusCode().value());
        String message = standard.getBody() instanceof ProblemDetail problemDetail && problemDetail.getDetail() != null
            ? problemDetail.getDetail()
            : httpStatus.getReasonPhrase();
        return ResponseEntity.status(httpStatus)
            .headers(standard.getHeaders())
            .body(ApiResponse.error(httpStatus.name(), message));
    }
}
