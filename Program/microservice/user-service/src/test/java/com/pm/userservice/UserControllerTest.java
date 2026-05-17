package com.pm.userservice;

import com.pm.userservice.controller.UserController;
import com.pm.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserControllerTest {

    private final UserService userService = mock(UserService.class);
    private final UserController controller = new UserController(userService);

    @Test
    void idDocumentImageEndpointRequiresUserViewPermission() throws Exception {
        Method method = UserController.class.getMethod("getUserIdDocumentImage", UUID.class, org.springframework.security.core.Authentication.class);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo("hasAuthority('CAN_VIEW_USERS')");
    }

    @Test
    void idDocumentImageUsesSafeContentTypeNoStoreAnd404WhenMissing() {
        UUID userId = UUID.randomUUID();
        byte[] imageBytes = "image".getBytes(StandardCharsets.UTF_8);
        when(userService.getIdDocumentImage(userId)).thenReturn(Optional.of(
                new UserService.IdDocumentImage(imageBytes, "invalid media type")
        ));

        ResponseEntity<byte[]> response = controller.getUserIdDocumentImage(userId, null);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo(CacheControl.noStore().getHeaderValue());
        assertThat(response.getBody()).isEqualTo(imageBytes);

        UUID missingUserId = UUID.randomUUID();
        when(userService.getIdDocumentImage(missingUserId)).thenReturn(Optional.empty());

        ResponseEntity<byte[]> missing = controller.getUserIdDocumentImage(missingUserId, null);

        assertThat(missing.getStatusCode().value()).isEqualTo(404);
    }
}
