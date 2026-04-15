package com.pm.planningservice.service;

import com.pm.planningservice.dto.PlanningAssignmentMutationResponseDTO;
import com.pm.planningservice.dto.PlanningAssignmentSaveRequestDTO;
import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.ClientCompanyRepository;
import com.pm.planningservice.repository.EventRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlanningManagementServiceTest {

    @Mock
    private ClientCompanyRepository clientCompanyRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private ScheduleEntryRepository scheduleEntryRepository;

    @InjectMocks
    private PlanningManagementService planningManagementService;

    @Test
    void createAssignmentResetsExistingEntryToPendingStatus() {
        UUID companyId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        Shift shift = new Shift();
        shift.setShiftId(shiftId);
        shift.setEventId(eventId);
        shift.setStartTime(LocalDateTime.of(2026, 5, 1, 9, 0));
        shift.setEndTime(LocalDateTime.of(2026, 5, 1, 17, 0));
        shift.setFunctionName("BAR");

        Event event = new Event();
        event.setEventId(eventId);
        event.setCompanyId(companyId);
        event.setStartDate(LocalDate.of(2026, 5, 1));
        event.setEndDate(LocalDate.of(2026, 5, 1));
        event.setFinalized(false);

        ScheduleEntry existingEntry = new ScheduleEntry();
        existingEntry.setScheduleEntryId(scheduleEntryId);
        existingEntry.setShiftId(shiftId);
        existingEntry.setUserId(userId);
        existingEntry.setStatus(ScheduleEntryStatus.CONFIRMED);
        existingEntry.setTimesheetExported(true);
        existingEntry.setTimesheetExportedAt(LocalDateTime.of(2026, 5, 2, 8, 30));

        PlanningAssignmentSaveRequestDTO request = new PlanningAssignmentSaveRequestDTO();
        request.setUserId(userId);
        request.setStatus(ScheduleEntryStatus.ASSIGNED);

        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(eventRepository.findByEventIdAndCompanyId(eventId, companyId)).thenReturn(Optional.of(event));
        when(scheduleEntryRepository.findFirstByShiftIdAndUserId(shiftId, userId)).thenReturn(Optional.of(existingEntry));
        when(scheduleEntryRepository.save(existingEntry)).thenReturn(existingEntry);

        PlanningAssignmentMutationResponseDTO response =
                planningManagementService.createAssignment(companyId, shiftId, request);

        assertEquals(scheduleEntryId, response.getScheduleEntryId());
        assertEquals(shiftId, response.getShiftId());
        assertEquals(ScheduleEntryStatus.ASSIGNED, existingEntry.getStatus());
        assertEquals(false, existingEntry.getTimesheetExported());
        assertNull(existingEntry.getTimesheetExportedAt());
        verify(scheduleEntryRepository).save(existingEntry);
    }

    @Test
    void createAssignmentCreatesNewEntryWhenNoExistingAssignmentExists() {
        UUID companyId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        Shift shift = new Shift();
        shift.setShiftId(shiftId);
        shift.setEventId(eventId);
        shift.setStartTime(LocalDateTime.of(2026, 5, 1, 9, 0));
        shift.setEndTime(LocalDateTime.of(2026, 5, 1, 17, 0));
        shift.setFunctionName("BAR");

        Event event = new Event();
        event.setEventId(eventId);
        event.setCompanyId(companyId);
        event.setStartDate(LocalDate.of(2026, 5, 1));
        event.setEndDate(LocalDate.of(2026, 5, 1));
        event.setFinalized(false);

        ScheduleEntry savedEntry = new ScheduleEntry();
        savedEntry.setScheduleEntryId(scheduleEntryId);
        savedEntry.setShiftId(shiftId);
        savedEntry.setUserId(userId);
        savedEntry.setStatus(ScheduleEntryStatus.ASSIGNED);
        savedEntry.setTimesheetExported(false);

        PlanningAssignmentSaveRequestDTO request = new PlanningAssignmentSaveRequestDTO();
        request.setUserId(userId);
        request.setStatus(ScheduleEntryStatus.ASSIGNED);

        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(eventRepository.findByEventIdAndCompanyId(eventId, companyId)).thenReturn(Optional.of(event));
        when(scheduleEntryRepository.findFirstByShiftIdAndUserId(shiftId, userId)).thenReturn(Optional.empty());
        when(scheduleEntryRepository.save(any(ScheduleEntry.class))).thenReturn(savedEntry);

        PlanningAssignmentMutationResponseDTO response =
                planningManagementService.createAssignment(companyId, shiftId, request);

        assertEquals(scheduleEntryId, response.getScheduleEntryId());
        assertEquals(shiftId, response.getShiftId());
        verify(scheduleEntryRepository).save(any(ScheduleEntry.class));
    }
}
