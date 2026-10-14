package com.ecoreturn.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ecoreturn.entity.RefreshToken;
import com.ecoreturn.entity.User;
import com.ecoreturn.mapper.RefreshTokenMapper;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;

    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    @Transactional
    public User updateDisplayName(Long userId, String displayName) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        user.setDisplayName(displayName);
        userMapper.updateById(user);
        return user;
    }

    public List<User> getTopContributors(int limit) {
        return userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .isNull(User::getDeletedAt)
                .orderByDesc(User::getKarmaPoints)
                .last("LIMIT " + limit)
        );
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;

        // Anonymize user data (GDPR soft delete)
        user.setEmail(null);
        user.setDisplayName("Deleted User");
        user.setAvatarUrl(null);
        user.setProviderId("deleted_" + userId);
        user.setDeletedAt(LocalDateTime.now());
        userMapper.updateById(user);

        // Revoke all refresh tokens
        refreshTokenMapper.delete(
                new LambdaQueryWrapper<RefreshToken>()
                        .eq(RefreshToken::getUserId, userId)
        );
    }
}
