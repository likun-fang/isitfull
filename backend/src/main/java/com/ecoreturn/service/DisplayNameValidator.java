package com.ecoreturn.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class DisplayNameValidator {

    private static final Set<String> FORBIDDEN_WORDS = Set.of(
            "admin", "administrator", "system", "moderator", "mod",
            "support", "staff", "official", "isitfull", "eco return",
            "fuck", "shit", "ass", "bitch", "cunt", "dick", "cock",
            "nigger", "faggot", "retard"
    );

    private static final Pattern SPECIAL_CHARS = Pattern.compile("[<>\"'&;\\\\]");

    public ValidationResult validate(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            return ValidationResult.invalid("Display name cannot be empty");
        }

        String trimmed = displayName.trim();
        if (trimmed.length() < 2 || trimmed.length() > 30) {
            return ValidationResult.invalid(
                "Display name must be between 2 and 30 characters");
        }

        if (SPECIAL_CHARS.matcher(trimmed).find()) {
            return ValidationResult.invalid(
                "Display name contains invalid characters");
        }

        String lower = trimmed.toLowerCase();
        for (String forbidden : FORBIDDEN_WORDS) {
            if (lower.contains(forbidden)) {
                return ValidationResult.invalid(
                    "Display name contains inappropriate content");
            }
        }

        return ValidationResult.valid(trimmed);
    }

    public record ValidationResult(boolean valid, String message, String sanitized) {
        public static ValidationResult valid(String sanitized) {
            return new ValidationResult(true, null, sanitized);
        }

        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, message, null);
        }
    }
}
