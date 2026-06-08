package com.pm.planningservice.service;

import com.pm.planningservice.dto.AuditLogCreateRequestDTO;
import com.pm.planningservice.integration.AuditLogClient;
import com.pm.planningservice.dto.EmployeePlanningAssignmentDTO;
import com.pm.planningservice.model.Project;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.model.TravelClaim;
import com.pm.planningservice.model.TravelClaimStatus;
import com.pm.planningservice.integration.UserDirectoryClient;
import com.pm.planningservice.repository.ProjectRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import com.pm.planningservice.repository.TravelClaimRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeePlanningServiceTest {

    @Mock
    private ScheduleEntryRepository scheduleEntryRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TravelClaimRepository travelClaimRepository;

    @Mock
    private PlanningTimesheetExportService planningTimesheetExportService;

    @Mock
    private UserDirectoryClient userDirectoryClient;

    @Mock
    private AuditLogClient auditLogClient;

    @InjectMocks
    private EmployeePlanningService employeePlanningService;

    @Test
    void getMyAssignmentsComputesPastStatusUsingProjectTimezone() {
        UUID companyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        TimeWindow timeWindow = createShiftWindowWithTimezoneDifference();
        Project project = createProject(companyId, projectId, timeWindow.zoneId().getId());
        Shift shift = createShift(projectId, shiftId, timeWindow.startTime(), timeWindow.endTime());
        ScheduleEntry entry = createEntry(scheduleEntryId, shiftId, userId, ScheduleEntryStatus.ASSIGNED);

        when(scheduleEntryRepository.findByUserId(userId)).thenReturn(List.of(entry));
        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(travelClaimRepository.findByScheduleEntryId(scheduleEntryId)).thenReturn(Optional.empty());
        when(userDirectoryClient.getDisplayNamesByUserIds(any())).thenReturn(Map.of(userId, "Test User"));

        List<EmployeePlanningAssignmentDTO> assignments = employeePlanningService.getMyAssignments(companyId, userId, "all");

        assertEquals(1, assignments.size());
        assertEquals(false, assignments.getFirst().getIsPast());
    }

    @Test
    void respondToAssignmentAllowsFutureShiftInProjectTimezone() {
        UUID companyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        TimeWindow timeWindow = createShiftWindowWithTimezoneDifference();
        Project project = createProject(companyId, projectId, timeWindow.zoneId().getId());
        Shift shift = createShift(projectId, shiftId, timeWindow.startTime(), timeWindow.endTime());
        ScheduleEntry entry = createEntry(scheduleEntryId, shiftId, userId, ScheduleEntryStatus.ASSIGNED);

        when(scheduleEntryRepository.findById(scheduleEntryId)).thenReturn(Optional.of(entry));
        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(scheduleEntryRepository.save(entry)).thenReturn(entry);
        when(travelClaimRepository.findByScheduleEntryId(scheduleEntryId)).thenReturn(Optional.empty());
        when(userDirectoryClient.getDisplayNamesByUserIds(any())).thenReturn(Map.of(userId, "Test User"));

        EmployeePlanningAssignmentDTO response = employeePlanningService.respondToAssignment(
                companyId,
                userId,
                scheduleEntryId,
                ScheduleEntryStatus.CONFIRMED
        );

        assertEquals("CONFIRMED", response.getStatus());
        verify(scheduleEntryRepository).save(entry);
    }

    @Test
    void reviewTravelClaimRecordsAuditEntryWhenAccessTokenIsAvailable() {
        UUID companyId = UUID.randomUUID();
        UUID reviewerUserId = UUID.randomUUID();
        UUID employeeUserId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        Project project = createProject(companyId, projectId, "Europe/Amsterdam");
        Shift shift = createShift(projectId, shiftId, LocalDateTime.now().minusHours(4), LocalDateTime.now().minusHours(1));
        shift.setName("Closing Shift");

        ScheduleEntry entry = createEntry(scheduleEntryId, shiftId, employeeUserId, ScheduleEntryStatus.CONFIRMED);
        TravelClaim claim = new TravelClaim();
        claim.setScheduleEntryId(scheduleEntryId);
        claim.setStatus(TravelClaimStatus.PENDING);

        when(scheduleEntryRepository.findById(scheduleEntryId)).thenReturn(Optional.of(entry));
        when(shiftRepository.findById(shiftId)).thenReturn(Optional.of(shift));
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(travelClaimRepository.findByScheduleEntryId(scheduleEntryId)).thenReturn(Optional.of(claim));
        when(travelClaimRepository.save(claim)).thenReturn(claim);
        when(userDirectoryClient.getDisplayNamesByUserIds(any())).thenReturn(Map.of(employeeUserId, "Test User"));
        injectAuditLogClient();

        employeePlanningService.reviewTravelClaim(
                companyId,
                reviewerUserId,
                scheduleEntryId,
                TravelClaimStatus.APPROVED,
                null,
                "access-token"
        );

        verify(auditLogClient).record(eq("access-token"), argThat((AuditLogCreateRequestDTO auditRequest) ->
                auditRequest != null
                        && "TRAVEL_CLAIMS".equals(auditRequest.getCategory())
                        && "APPROVED".equals(auditRequest.getAction())
                        && scheduleEntryId.toString().equals(auditRequest.getEntityId())
        ));
    }

    private void injectAuditLogClient() {
        try {
            Field field = EmployeePlanningService.class.getDeclaredField("auditLogClient");
            field.setAccessible(true);
            field.set(employeePlanningService, auditLogClient);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError(ex);
        }
    }

    private Project createProject(UUID companyId, UUID projectId, String projectTimezone) {
        Project project = new Project();
        project.setProjectId(projectId);
        project.setCompanyId(companyId);
        project.setName("Test project");
        project.setStartDate(LocalDate.now());
        project.setEndDate(LocalDate.now());
        project.setProjectTimezone(projectTimezone);
        project.setFinalized(false);
        return project;
    }

    private Shift createShift(UUID projectId, UUID shiftId, LocalDateTime startTime, LocalDateTime endTime) {
        Shift shift = new Shift();
        shift.setShiftId(shiftId);
        shift.setProjectId(projectId);
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
