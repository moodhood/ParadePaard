// src/main/java/com/pm/userservice/mapper/LeaveRequestMapper.java
package com.pm.userservice.mapper;

import com.pm.userservice.dto.LeaveRequestCreateDTO;
import com.pm.userservice.dto.LeaveRequestResponseDTO;
import com.pm.userservice.dto.LeaveRequestUpdateDTO;
import com.pm.userservice.model.LeaveRequest;
import com.pm.userservice.model.LeaveStatus;
import com.pm.userservice.model.LeaveType;
import com.pm.userservice.model.User;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class LeaveRequestMapper {
    private static final DateTimeFormatter D = DateTimeFormatter.ISO_DATE;

    private LeaveRequestMapper(){}

    public static LeaveRequest toNewEntity(User user, LeaveRequestCreateDTO dto) {
        LeaveRequest lr = new LeaveRequest();
        lr.setUser(user);
        lr.setType(LeaveType.valueOf(dto.getType()));
        lr.setStartDate(LocalDate.parse(dto.getStartDate(), D));
        lr.setEndDate(LocalDate.parse(dto.getEndDate(), D));
        lr.setHours(dto.getHours());
        lr.setReason(dto.getReason());
        lr.setStatus(LeaveStatus.PENDING);
        return lr;
    }

    public static void applyUpdates(LeaveRequest lr, LeaveRequestUpdateDTO dto) {
        if (dto.getType() != null) {
            lr.setType(LeaveType.valueOf(dto.getType()));
        }
        if (dto.getStartDate() != null) {
            lr.setStartDate(LocalDate.parse(dto.getStartDate(), D));
        }
        if (dto.getEndDate() != null) {
            lr.setEndDate(LocalDate.parse(dto.getEndDate(), D));
        }
        if (dto.getHours() != null) {
            lr.setHours(dto.getHours());
        }
        if (dto.getReason() != null) {
            lr.setReason(dto.getReason());
        }
        if (dto.getStatus() != null) {
            lr.setStatus(LeaveStatus.valueOf(dto.getStatus()));
        }
    }

    public static LeaveRequestResponseDTO toDTO(LeaveRequest lr) {
        LeaveRequestResponseDTO dto = new LeaveRequestResponseDTO();
        dto.setRequestId(lr.getRequestId().toString());
        dto.setUserId(lr.getUser().getUserId().toString());
        dto.setUserName(lr.getUser().getName());
        dto.setType(lr.getType().name());
        dto.setStartDate(lr.getStartDate().toString());
        dto.setEndDate(lr.getEndDate().toString());
        dto.setHours(lr.getHours());
        dto.setReason(lr.getReason());
        dto.setStatus(lr.getStatus().name());
        dto.setCreatedAt(lr.getCreatedAt().toString());
        dto.setUpdatedAt(lr.getUpdatedAt().toString());
        return dto;
    }
}
