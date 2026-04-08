package com.pm.planningservice.service;

import com.pm.planningservice.dto.FinalizePlanningRequestDTO;
import com.pm.planningservice.dto.FinalizePlanningResponseDTO;
import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.EventRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlanningFinalizationService {
    private static final Set<ScheduleEntryStatus> EXPORTABLE_STATUSES = EnumSet.of(
            ScheduleEntryStatus.CONFIRMED
    );

    private final EventRepository eventRepository;
    private final ShiftRepository shiftRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final PlanningTimesheetExportService planningTimesheetExportService;

    public PlanningFinalizationService(
            EventRepository eventRepository,
            ShiftRepository shiftRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            PlanningTimesheetExportService planningTimesheetExportService) {
        this.eventRepository = eventRepository;
        this.shiftRepository = shiftRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.planningTimesheetExportService = planningTimesheetExportService;
    }

    @Transactional
    public FinalizePlanningResponseDTO finalizePlanning(FinalizePlanningRequestDTO request) {
        validateRequest(request);
        if (!planningTimesheetExportService.usesAdminFinalize(request.getCompanyId())) {
            throw new IllegalArgumentException("This company uses automatic timesheet logging");
        }

        TimeWindow weekWindow = request.getEventId() == null
                ? toIsoWeekWindow(request.getIsoWeek(), request.getWeekBasedYear())
                : null;
        List<Event> candidateEvents = request.getEventId() != null
                ? resolveSingleEvent(request.getCompanyId(), request.getEventId())
                : resolveEventsByIsoWeek(request.getCompanyId(), weekWindow);

        List<Event> targetEvents = candidateEvents.stream()
                .filter(event -> !Boolean.TRUE.equals(event.getFinalized()))
                .toList();
        if (targetEvents.isEmpty()) {
            FinalizePlanningResponseDTO empty = new FinalizePlanningResponseDTO();
            empty.setCreatedTimesheets(0);
            return empty;
        }

        List<UUID> eventIds = targetEvents.stream().map(Event::getEventId).toList();
        Set<UUID> eventIdSet = Set.copyOf(eventIds);
        List<Shift> shifts = request.getEventId() != null
                ? shiftRepository.findByEventIdIn(eventIds)
                : shiftRepository.findByStartTimeGreaterThanEqualAndStartTimeLessThan(weekWindow.start(), weekWindow.end())
                .stream()
                .filter(shift -> eventIdSet.contains(shift.getEventId()))
                .toList();
        shifts = shifts.stream()
                .sorted(Comparator.comparing(Shift::getStartTime))
                .toList();
        if (shifts.isEmpty()) {
            FinalizePlanningResponseDTO empty = new FinalizePlanningResponseDTO();
            empty.setCreatedTimesheets(0);
            return empty;
        }

        List<UUID> shiftIds = shifts.stream().map(Shift::getShiftId).toList();
        List<ScheduleEntry> entries = scheduleEntryRepository.findByShiftIdInAndStatusInAndTimesheetExportedFalse(shiftIds, EXPORTABLE_STATUSES);
        if (entries.isEmpty()) {
            FinalizePlanningResponseDTO empty = new FinalizePlanningResponseDTO();
            empty.setCreatedTimesheets(0);
            return empty;
        }

        PlanningTimesheetExportService.ExportResult exportResult =
                planningTimesheetExportService.exportScheduleEntries(request.getCompanyId(), entries);

        LocalDateTime now = LocalDateTime.now();
        targetEvents.forEach(event -> {
            event.setFinalized(true);
            event.setFinalizedAt(now);
            event.setStatus("COMPLETED");
            event.setUpdatedAt(now);
        });
        eventRepository.saveAll(targetEvents);

        FinalizePlanningResponseDTO response = new FinalizePlanningResponseDTO();
        response.setCreatedTimesheets(exportResult.createdCount());
        response.setFinalizedEventIds(targetEvents.stream().map(Event::getEventId).toList());
        response.setWarnings(exportResult.warnings());
        return response;
    }

    private List<Event> resolveSingleEvent(UUID companyId, UUID eventId) {
        return eventRepository.findByEventIdAndCompanyId(eventId, companyId)
                .map(List::of)
                .orElse(List.of());
    }

    private List<Event> resolveEventsByIsoWeek(UUID companyId, TimeWindow weekWindow) {
        List<Shift> weekShifts = shiftRepository.findByStartTimeGreaterThanEqualAndStartTimeLessThan(
                weekWindow.start(),
                weekWindow.end()
        );
        Set<UUID> weekEventIds = weekShifts.stream()
                .map(Shift::getEventId)
                .collect(Collectors.toSet());
        if (weekEventIds.isEmpty()) {
            return List.of();
        }

        return eventRepository.findByEventIdIn(weekEventIds).stream()
                .filter(event -> companyId.equals(event.getCompanyId()))
                .toList();
    }

    private TimeWindow toIsoWeekWindow(Integer isoWeek, Integer weekBasedYear) {
        LocalDate startOfWeek = LocalDate.of(weekBasedYear, 1, 4)
                .with(WeekFields.ISO.weekOfWeekBasedYear(), isoWeek)
                .with(WeekFields.ISO.dayOfWeek(), 1);
        return new TimeWindow(startOfWeek.atStartOfDay(), startOfWeek.plusDays(7).atStartOfDay());
    }

    private void validateRequest(FinalizePlanningRequestDTO request) {
        boolean hasEvent = request.getEventId() != null;
        boolean hasWeek = request.getIsoWeek() != null || request.getWeekBasedYear() != null;

        if (hasEvent && hasWeek) {
            throw new IllegalArgumentException("Provide either eventId or isoWeek/weekBasedYear, not both");
        }
        if (!hasEvent && !hasWeek) {
            throw new IllegalArgumentException("Provide eventId or isoWeek/weekBasedYear");
        }
        if (!hasEvent && (request.getIsoWeek() == null || request.getWeekBasedYear() == null)) {
            throw new IllegalArgumentException("Both isoWeek and weekBasedYear are required for week finalization");
        }
        if (!hasEvent && (request.getIsoWeek() < 1 || request.getIsoWeek() > 53)) {
            throw new IllegalArgumentException("isoWeek must be between 1 and 53");
        }
    }

    private record TimeWindow(LocalDateTime start, LocalDateTime end) {
    }
}
