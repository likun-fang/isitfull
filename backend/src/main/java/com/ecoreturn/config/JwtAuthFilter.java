package com.ecoreturn.config;

import com.ecoreturn.entity.User;
import com.ecoreturn.mapper.UserMapper;
import com.ecoreturn.service.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        try {
            String token = extractToken(httpRequest);
            if (token != null) {
                Long userId = jwtService.validateAndGetUserId(token);
                if (userId != null) {
                    User user = userMapper.selectById(userId);
                    if (user != null && user.getDeletedAt() == null) {
                        UserContext.setCurrentUser(user);
                    }
                }
            }
            chain.doFilter(request, response);
        } finally {
            UserContext.clear();
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
