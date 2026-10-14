package com.ecoreturn.aspect;

import com.ecoreturn.config.AdminContext;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.exception.ForbiddenException;
import com.ecoreturn.exception.UnauthorizedException;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuthAspect {

    @Before("@annotation(com.ecoreturn.annotation.RequireAuth) || @within(com.ecoreturn.annotation.RequireAuth)")
    public void checkAuth() {
        if (UserContext.getCurrentUser() == null) {
            throw new UnauthorizedException("Authentication required");
        }
    }

    @Before("@annotation(com.ecoreturn.annotation.RequireAdmin) || @within(com.ecoreturn.annotation.RequireAdmin)")
    public void checkAdmin() {
        if (AdminContext.getCurrentAdmin() == null) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
