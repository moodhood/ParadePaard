package com.pm.contractservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.lang.reflect.Method;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ContractControllerSecurityTest {

    @Test
    void signContractRequiresOwnershipWithoutRoleAuthority() throws NoSuchMethodException {
        Method method = ContractController.class.getMethod(
                "signContract",
                UUID.class,
                com.pm.contractservice.dto.SignContractRequestDTO.class,
                Authentication.class,
                jakarta.servlet.http.HttpServletRequest.class
        );

        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);

        assertThat(preAuthorize.value()).isEqualTo("@contractPermission.isOwner(#id, authentication)");
    }
}
