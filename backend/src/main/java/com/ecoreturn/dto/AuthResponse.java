package com.ecoreturn.dto;

import com.ecoreturn.entity.User;
import com.ecoreturn.enums.UserRank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
    private MergeInfo merged;

    @Data
    @Builder
    public static class UserDto {
        private String id;
        private String provider;
        private String email;
        private String displayName;
        private String avatarUrl;
        private int karmaPoints;
        private UserRank rank;

        public static UserDto fromEntity(User user) {
            return UserDto.builder()
                    .id(user.getId().toString())
                    .provider(user.getProvider().getValue())
                    .email(user.getEmail())
                    .displayName(user.getDisplayName())
                    .avatarUrl(user.getAvatarUrl())
                    .karmaPoints(user.getKarmaPoints())
                    .rank(UserRank.fromKarma(user.getKarmaPoints()))
                    .build();
        }
    }

    @Data
    @Builder
    public static class MergeInfo {
        private String fromGuestId;
        private int pointsMerged;
    }
}
