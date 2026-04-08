package com.pm.planningservice.service;

import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.EventRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class PlanningAutoTimesheetScheduler {
    private final ShiftRepository shiftRepository;
    private final EventRepository eventRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final PlanningTimesheetExportService planningTimesheetExportService;

    public PlanningAutoTimesheetScheduler(
            ShiftRepository shiftRepository,
            EventRepository eventRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            PlanningTimesheetExportService planningTimesheetExportService
    ) {
        this.shiftRepository = shiftRepository;
        this.eventRepository = eventRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.planningTimesheetExportService = planningTimesheetExportService;
    }

    @Scheduled(fixedDelayString = "${planning.auto-timesheet.delay-ms:60000}")
    public void exportEndedConfirmedShifts() {
        List<Shift> endedShifts = shiftRepository.findByEndTimeLessThanEqual(LocalDateTime.now());
        if (endedShifts.isEmpty()) {
            return;
        }

        List<ScheduleEntry> entries = scheduleEntryRepository.findByShiftIdInAndStatusInAndTimesheetExportedFalse(
                endedShifts.stream().map(Shift::getShiftId).toList(),
                List.of(ScheduleEntryStatus.CONFIRMED)
        );
        if (entries.isEmpty()) {
            return;
        }

        Map<UUID, Event> eventById = eventRepository.findByEventIdIn(
                        endedShifts.stream().map(Shift::getEventId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(Event::getEventId, event -> event));

        Map<UUID, Shift> shiftById = endedShifts.stream()
                .collect(Collectors.toMap(Shift::getShiftId, shift -> shift));

        Map<UUID, List<ScheduleEntry>> entriesByCompanyId = entries.stream()
                .filter(entry -> shiftById.containsKey(entry.getShiftId()))
                .filter(entry -> {
                    Shift shift = shiftById.get(entry.getShiftId());
                    Event event = eventById.get(shift.getEventId());
                    return event != null;
                })
                .collect(Collectors.groupingBy(entry -> {
                    Shift shift = shiftById.get(entry.getShiftId());
                    Event event = eventById.get(shift.getEventId());
                    return event.getCompanyId();
                }));

        entriesByCompanyId.forEach((companyId, companyEntries) -> {
            if (planningTimesheetExportService.usesAutoOnShiftEnd(companyId)) {
                planningTimesheetExportService.exportScheduleEntries(companyId, companyEntries);
            }
        });
    }
}
