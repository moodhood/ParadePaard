package com.pm.userservice;

import com.pm.userservice.controller.JobApplicationController;
import com.pm.userservice.model.JobApplication;
import com.pm.userservice.service.JobApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JobApplicationControllerTest {

    private final JobApplicationService service = mock(JobApplicationService.class);
    private final JobApplicationController controller = new JobApplicationController(service);

    @Test
    void downloadCvFallsBackToOctetStreamWhenStoredContentTypeIsInvalid() {
        UUID applicationId = UUID.randomUUID();
        JobApplication application = new JobApplication();
        application.setCvFileName("resume.bin");
        application.setCvContentType("not a media type");
        application.setCvBytes("cv bytes".getBytes(StandardCharsets.UTF_8));
        when(service.getApplicationCv(applicationId)).thenReturn(application);

        ResponseEntity<byte[]> response = controller.downloadCv(applicationId);

        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(response.getBody()).isEqualTo("cv bytes".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void downloadProfilePictureFallsBackToOctetStreamWhenStoredContentTypeIsInvalid() {
        UUID applicationId = UUID.randomUUID();
        JobApplication application = new JobApplication();
        application.setProfilePictureFileName("alex.bin");
        application.setProfilePictureContentType("not a media type");
        application.setProfilePictureBytes("pic bytes".getBytes(StandardCharsets.UTF_8));
        when(service.getApplicationProfilePicture(applicationId)).thenReturn(application);

        ResponseEntity<byte[]> response = controller.downloadProfilePicture(applicationId);

        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(response.getBody()).isEqualTo("pic bytes".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void readEndpointsAllowViewOrReviewApplicationPermission() throws Exception {
        assertApplicationReadPermission(JobApplicationController.class.getMethod("getApplications"));
        assertApplicationReadPermission(JobApplicationController.class.getMethod("getApplication", UUID.class));
        assertApplicationReadPermission(JobApplicationController.class.getMethod("downloadCv", UUID.class));
        assertApplicationReadPermission(JobApplicationController.class.getMethod("downloadProfilePicture", UUID.class));
    }

    private static void assertApplicationReadPermission(Method method) {
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).contains("CAN_VIEW_APPLICATIONS");
        assertThat(annotation.value()).contains("CAN_REVIEW_APPLICATIONS");
        assertThat(annotation.value()).contains(" or ");
    }
}
