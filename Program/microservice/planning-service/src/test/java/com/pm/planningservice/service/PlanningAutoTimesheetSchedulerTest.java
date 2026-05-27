package com.pm.planningservice.service;

import com.pm.planningservice.model.Project;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.ProjectRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlanningAutoTimesheetSchedulerTest {

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ScheduleEntryRepository scheduleEntryRepository;

    @Mock
    private PlanningTimesheetExportService planningTimesheetExportService;

    @InjectMocks
    private PlanningAutoTimesheetScheduler planningAutoTimesheetScheduler;

    @Test
    void exportEndedConfirmedShiftsSkipsShiftThatIsStillFutureInProjectTimezone() {
        UUID companyId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID shiftId = UUID.randomUUID();
        UUID scheduleEntryId = UUID.randomUUID();

        TimeWindow timeWindow = createShiftWindowWithTimezoneDifference();

        Project project = new Project();
        project.setProjectId(projectId);
        project.setCompanyId(companyId);
        project.setName("Timezone project");
        project.setStartDate(LocalDate.now());
        project.setEndDate(LocalDate.now());
        project.setProjectTimezone(timeWindow.zoneId().getId());

        Shift shift = new Shift();
        shift.setShiftId(shiftId);
        shift.setProjectId(projectId);
        shift.setStartTime(timeWindow.startTime());
        shift.setEndTime(timeWindow.endTime());
        shift.setFunctionName("Bar");

        ScheduleEntry entry = new ScheduleEntry();
        entry.setScheduleEntryId(scheduleEntryId);
        entry.setShiftId(shiftId);
        entry.setStatus(ScheduleEntryStatus.CONFIRMED);
        entry.setTimesheetExported(false);

        when(scheduleEntryRepository.findByStatusInAndTimesheetExportedFalse(List.of(ScheduleEntryStatus.CONFIRMED)))
                .thenReturn(List.of(entry));
        when(shiftRepository.findAllById(List.of(shiftId))).thenReturn(List.of(shift));
        when(projectRepository.findByProjectIdIn(List.of(projectId))).thenReturn(List.of(project));

        planningAutoTimesheetScheduler.exportEndedConfirmedShifts();

        verify(planningTimesheetExportService, never()).usesAutoOnShiftEnd(companyId);
        verify(planningTimesheetExportService, never()).exportScheduleEntries(companyId, List.of(entry));
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
