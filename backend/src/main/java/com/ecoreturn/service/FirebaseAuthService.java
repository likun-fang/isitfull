package com.ecoreturn.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FirebaseAuthService {

    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthService(@Nullable FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    public record FirebaseUser(
            String uid,
            String email,
            String displayName,
            String photoUrl,
            String provider
    ) {}

    public FirebaseUser verifyToken(String idToken) {
        if (firebaseAuth == null) {
            log.warn("Firebase not configured, social login unavailable");
            return null;
        }
        try {
            FirebaseToken token = firebaseAuth.verifyIdToken(idToken);

            String provider = "unknown";
            if (token.getClaims().containsKey("firebase")) {
                @SuppressWarnings("unchecked")
                var firebase = (java.util.Map<String, Object>) token.getClaims().get("firebase");
                if (firebase.containsKey("sign_in_provider")) {
                    provider = (String) firebase.get("sign_in_provider");
                }
            }

            return new FirebaseUser(
                    token.getUid(),
                    token.getEmail(),
                    token.getName(),
                    token.getPicture(),
                    provider
            );
        } catch (Exception e) {
            log.error("Firebase token verification failed: {}", e.getMessage());
            return null;
        }
    }
}
