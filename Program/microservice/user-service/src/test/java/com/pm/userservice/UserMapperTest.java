package com.pm.userservice;

import com.pm.userservice.dto.UserResponseDTO;
import com.pm.userservice.mapper.UserMapper;
import com.pm.userservice.model.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    @Test
    void toDtoReportsBothFrontAndBackIdDocumentUploads() {
        User user = new User();
        user.setIdDocumentImage(new byte[] { 1 });
        user.setIdDocumentBackImage(new byte[] { 2 });

        UserResponseDTO dto = UserMapper.toDTO(user);

        assertThat(dto.getHasIdDocumentImage()).isTrue();
        assertThat(dto.getHasIdDocumentBackImage()).isTrue();
    }
}
