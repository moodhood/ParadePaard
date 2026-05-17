package com.pm.userservice;

import com.pm.userservice.controller.JobApplicationController;
import com.pm.userservice.model.JobApplication;
import com.pm.userservice.service.JobApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

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
}
