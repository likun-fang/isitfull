package com.ecoreturn.service;

import com.ecoreturn.entity.User;
import com.ecoreturn.enums.KarmaReason;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserMapper userMapper;
    private final KarmaService karmaService;

    public List<User> listUsers(String search, int page, int size) {
        int offset = (page - 1) * size;
        if (search != null && !search.isBlank()) {
            return userMapper.searchUsers(search.trim(), size, offset);
        }
        return userMapper.listUsers(size, offset);
    }

    public int countUsers(String search) {
        if (search != null && !search.isBlank()) {
            return userMapper.countSearchUsers(search.trim());
        }
        return userMapper.countAllUsers();
    }

    public User getUserDetail(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        return user;
    }

    public void banUser(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        if (user.getDeletedAt() != null) {
            throw new IllegalStateException("User is already banned");
        }
        user.setDeletedAt(LocalDateTime.now());
        userMapper.updateById(user);
    }

    public void unbanUser(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        if (user.getDeletedAt() == null) {
            throw new IllegalStateException("User is not banned");
        }
        user.setDeletedAt(null);
        userMapper.updateById(user);
    }

    public void adjustKarma(Long userId, int points, String reason) {
        karmaService.awardKarma(userId, points, KarmaReason.ADMIN_ADJUST, "ADMIN", null);
    }
}
