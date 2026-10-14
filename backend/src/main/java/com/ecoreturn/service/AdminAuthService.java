package com.ecoreturn.service;

import com.ecoreturn.entity.AdminUser;
import com.ecoreturn.exception.BadRequestException;
import com.ecoreturn.exception.UnauthorizedException;
import com.ecoreturn.mapper.AdminUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserMapper adminUserMapper;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String login(String username, String password) {
        AdminUser admin = adminUserMapper.findByUsername(username);
        if (admin == null || !Boolean.TRUE.equals(admin.getIsActive())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        admin.setLastLoginAt(LocalDateTime.now());
        adminUserMapper.updateById(admin);

        return jwtService.generateAdminToken(admin.getId());
    }

    public void changePassword(Long adminId, String oldPassword, String newPassword) {
        AdminUser admin = adminUserMapper.selectById(adminId);
        if (admin == null) {
            throw new UnauthorizedException("Admin not found");
        }

        if (!passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserMapper.updateById(admin);
    }
}
