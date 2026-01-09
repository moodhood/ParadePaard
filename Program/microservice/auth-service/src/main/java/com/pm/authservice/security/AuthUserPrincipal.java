package com.pm.authservice.security;

import java.security.Principal;
import java.util.UUID;

public class AuthUserPrincipal implements Principal {
    private final String email;
    private final UUID userId;
    private final UUID companyId;

    public AuthUserPrincipal(String email, UUID userId, UUID companyId) {
        this.email = email;
        this.userId = userId;
        this.companyId = companyId;
    }

    @Override
    public String getName() {
        return email == null ? "" : email;
    }

    public String getEmail() {
        return email;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCompanyId() {
        return companyId;
    }
}
