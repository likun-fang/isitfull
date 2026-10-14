package com.ecoreturn.config;

import com.ecoreturn.entity.AdminUser;

public class AdminContext {

    private static final ThreadLocal<AdminUser> currentAdmin = new ThreadLocal<>();

    public static void setCurrentAdmin(AdminUser admin) {
        currentAdmin.set(admin);
    }

    public static AdminUser getCurrentAdmin() {
        return currentAdmin.get();
    }

    public static Long getCurrentAdminId() {
        AdminUser admin = currentAdmin.get();
        return admin != null ? admin.getId() : null;
    }

    public static void clear() {
        currentAdmin.remove();
    }
}
