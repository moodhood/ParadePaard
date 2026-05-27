package com.pm.planningservice.service;

import com.pm.planningservice.model.Project;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.ProjectRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class PlanningAutoTimesheetScheduler {
    private final ShiftRepository shiftRepository;
    private final ProjectRepository projectRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final PlanningTimesheetExportService planningTimesheetExportService;

    public PlanningAutoTimesheetScheduler(
            ShiftRepository shiftRepository,
            ProjectRepository projectRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            PlanningTimesheetExportService planningTimesheetExportService
    ) {
        this.shiftRepository = shiftRepository;
        this.projectRepository = projectRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.planningTimesheetExportService = planningTimesheetExportService;
    }

    @Scheduled(fixedDelayString = "${planning.auto-timesheet.delay-ms:60000}")
    public void exportEndedConfirmedShifts() {
        List<ScheduleEntry> entries = scheduleEntryRepository.findByStatusInAndTimesheetExportedFalse(
                List.of(ScheduleEntryStatus.CONFIRMED)
        );
        if (entries.isEmpty()) {
            return;
        }

        Map<UUID, Shift> shiftById = shiftRepository.findAllById(
                        entries.stream().map(ScheduleEntry::getShiftId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(Shift::getShiftId, shift -> shift));
        if (shiftById.isEmpty()) {
            return;
        }

        Map<UUID, Project> projectById = projectRepository.findByProjectIdIn(
                        shiftById.values().stream().map(Shift::getProjectId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(Project::getProjectId, project -> project));

        Map<UUID, List<ScheduleEntry>> entriesByCompanyId = entries.stream()
                .filter(entry -> {
                    Shift shift = shiftById.get(entry.getShiftId());
                    if (shift == null) {
                        return false;
                    }
                    Project project = projectById.get(shift.getProjectId());
                    return project != null && PlanningTimeZoneSupport.hasShiftEnded(shift, project);
                })
                .collect(Collectors.groupingBy(entry -> {
                    Shift shift = shiftById.get(entry.getShiftId());
                    Project project = projectById.get(shift.getProjectId());
                    return project.getCompanyId();
                }));

        entriesByCompanyId.forEach((companyId, companyEntries) -> {
            if (planningTimesheetExportService.usesAutoOnShiftEnd(companyId)) {
                planningTimesheetExportService.exportScheduleEntries(companyId, companyEntries);
            }
        });
    }
}
