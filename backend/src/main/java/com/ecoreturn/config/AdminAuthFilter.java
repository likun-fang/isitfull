package com.ecoreturn.config;

import com.ecoreturn.entity.AdminUser;
import com.ecoreturn.mapper.AdminUserMapper;
import com.ecoreturn.service.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AdminAuthFilter implements Filter {

    private final JwtService jwtService;
    private final AdminUserMapper adminUserMapper;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();

        if (!path.startsWith("/api/admin/")) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String token = extractToken(httpRequest);
            if (token != null) {
                Long adminId = jwtService.validateAndGetAdminId(token);
                if (adminId != null) {
                    AdminUser admin = adminUserMapper.selectById(adminId);
                    if (admin != null && Boolean.TRUE.equals(admin.getIsActive())) {
                        AdminContext.setCurrentAdmin(admin);
                    }
                }
            }
            chain.doFilter(request, response);
        } finally {
            AdminContext.clear();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
