package com.pm.planningservice.service;

import com.pm.planningservice.dto.EmployeePlanningAssignmentDTO;
import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.EventRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import com.pm.planningservice.repository.TravelClaimRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeePlanningServiceTest {

    @Mock
    private ScheduleEntryRepository scheduleEntryRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TravelClaimRepository travelClaimRepository;

    @Mock
    private PlanningTimesheetExportService planningTimesheetExportService;

    @InjectMocks
    private EmployeePlanningService employeePlanningService;

    @Test
    void getMyAssignmentsComputesPastStatusUsingEventTimezone() {
        UUID companyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        TimeWindow timeWindow = createShiftWindowWithTimezoneDifference();
        Event event = createEvent(companyId, eventId, timeWindow.zoneId().getId());
        Shift shift = createShift(eventId, shiftId, timeWindow.startTime(), timeWindow.endTime());
        ScheduleEntry entry = createEntry(scheduleEntryId, shiftId, userId, ScheduleEntryStatus.ASSIGNED);

        when(scheduleEntryRepository.findByUserId(userId)).thenReturn(List.of(entry));
        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(travelClaimRepository.findByScheduleEntryId(scheduleEntryId)).thenReturn(Optional.empty());

        List<EmployeePlanningAssignmentDTO> assignments = employeePlanningService.getMyAssignments(companyId, userId, "all");

        assertEquals(1, assignments.size());
        assertEquals(false, assignments.getFirst().getIsPast());
    }

    @Test
    void respondToAssignmentAllowsFutureShiftInEventTimezone() {
        UUID companyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        TimeWindow timeWindow = createShiftWindowWithTimezoneDifference();
        Event event = createEvent(companyId, eventId, timeWindow.zoneId().getId());
        Shift shift = createShift(eventId, shiftId, timeWindow.startTime(), timeWindow.endTime());
        ScheduleEntry entry = createEntry(scheduleEntryId, shiftId, userId, ScheduleEntryStatus.ASSIGNED);

        when(scheduleEntryRepository.findById(scheduleEntryId)).thenReturn(Optional.of(entry));
        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(scheduleEntryRepository.save(entry)).thenReturn(entry);
        when(travelClaimRepository.findByScheduleEntryId(scheduleEntryId)).thenReturn(Optional.empty());

        EmployeePlanningAssignmentDTO response = employeePlanningService.respondToAssignment(
                companyId,
                userId,
                scheduleEntryId,
                ScheduleEntryStatus.CONFIRMED
        );

        assertEquals("CONFIRMED", response.getStatus());
        verify(scheduleEntryRepository).save(entry);
    }

    private Event createEvent(UUID companyId, UUID eventId, String eventTimezone) {
        Event event = new Event();
        event.setEventId(eventId);
        event.setCompanyId(companyId);
        event.setName("Test event");
        event.setStartDate(LocalDate.now());
        event.setEndDate(LocalDate.now());
        event.setEventTimezone(eventTimezone);
        event.setFinalized(false);
        return event;
    }

    private Shift createShift(UUID eventId, UUID shiftId, LocalDateTime startTime, LocalDateTime endTime) {
        Shift shift = new Shift();
        shift.setShiftId(shiftId);
        shift.setEventId(eventId);
        shift.setFunctionName("Bar");
        shift.setStartTime(startTime);
        shift.setEndTime(endTime);
        return shift;
    }

    private ScheduleEntry createEntry(UUID scheduleEntryId, UUID shiftId, UUID userId, ScheduleEntryStatus status) {
        ScheduleEntry entry = new ScheduleEntry();
        entry.setScheduleEntryId(scheduleEntryId);
        entry.setShiftId(shiftId);
        entry.setUserId(userId);
        entry.setStatus(status);
        entry.setTimesheetExported(false);
        return entry;
    }

    private TimeWindow createShiftWindowWithTimezoneDifference() {
        LocalDateTime systemNow = LocalDateTime.now();
        for (String zoneId : List.of(
                "Etc/GMT+12",
                "Pacific/Niue",
                "Pacific/Honolulu",
                "America/Anchorage",
                "America/Los_Angeles",
                "UTC",
                "Europe/Amsterdam",
                "Asia/Tokyo",
                "Pacific/Auckland"
        )) {
            ZoneId candidateZone = ZoneId.of(zoneId);
            LocalDateTime candidateNow = LocalDateTime.now(candidateZone);
            if (candidateNow.isBefore(systemNow.minusMinutes(90))) {
                return new TimeWindow(candidateZone, candidateNow.minusHours(1), candidateNow.plusMinutes(30));
            }
        }
        throw new IllegalStateException("Could not find a timezone with a large enough difference from the system clock");
    }

    private record TimeWindow(ZoneId zoneId, LocalDateTime startTime, LocalDateTime endTime) {
    }
}
