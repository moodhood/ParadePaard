package com.pm.planningservice.service;

import com.pm.planningservice.dto.EmployeePlanningAssignmentDTO;
import com.pm.planningservice.dto.TravelClaimSummaryDTO;
import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.model.TravelClaim;
import com.pm.planningservice.model.TravelClaimStatus;
import com.pm.planningservice.repository.EventRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import com.pm.planningservice.repository.TravelClaimRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeePlanningService {
    private static final long MAX_PROOF_FILE_SIZE_BYTES = 2_000_000L;

    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ShiftRepository shiftRepository;
    private final EventRepository eventRepository;
    private final TravelClaimRepository travelClaimRepository;
    private final PlanningTimesheetExportService planningTimesheetExportService;

    public EmployeePlanningService(
            ScheduleEntryRepository scheduleEntryRepository,
            ShiftRepository shiftRepository,
            EventRepository eventRepository,
            TravelClaimRepository travelClaimRepository,
            PlanningTimesheetExportService planningTimesheetExportService
    ) {
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.shiftRepository = shiftRepository;
        this.eventRepository = eventRepository;
        this.travelClaimRepository = travelClaimRepository;
        this.planningTimesheetExportService = planningTimesheetExportService;
    }

    @Transactional(readOnly = true)
    public List<EmployeePlanningAssignmentDTO> getMyAssignments(UUID companyId, UUID userId, String scope) {
        return loadAssignmentsForUser(companyId, userId).stream()
                .filter(dto -> matchesScope(dto, scope))
                .sorted(Comparator
                        .comparing(EmployeePlanningAssignmentDTO::getShiftDate)
                        .thenComparing(EmployeePlanningAssignmentDTO::getStartTime))
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeePlanningAssignmentDTO getMyAssignmentDetail(UUID companyId, UUID userId, UUID scheduleEntryId) {
        EmployeePlanningAssignmentDTO dto = mapAssignment(requireOwnedEntry(companyId, userId, scheduleEntryId));
        if (dto.getStatus() == null || !"CONFIRMED".equalsIgnoreCase(dto.getStatus())) {
            throw new IllegalArgumentException("Only accepted shifts can be opened in detail");
        }
        return dto;
    }

    @Transactional
    public EmployeePlanningAssignmentDTO respondToAssignment(UUID companyId, UUID userId, UUID scheduleEntryId, ScheduleEntryStatus status) {
        if (status != ScheduleEntryStatus.CONFIRMED && status != ScheduleEntryStatus.CANCELLED) {
            throw new IllegalArgumentException("Status must be CONFIRMED or CANCELLED");
        }
        ScheduleEntry entry = requireOwnedEntry(companyId, userId, scheduleEntryId);
        Shift shift = requireShift(entry.getShiftId(), companyId);
        if (!shift.getEndTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Past shifts can no longer be accepted or declined");
        }
        entry.setStatus(status);
        entry.setTimesheetExported(false);
        entry.setTimesheetExportedAt(null);
        return mapAssignment(scheduleEntryRepository.save(entry));
    }

    @Transactional
    public EmployeePlanningAssignmentDTO saveTravelClaim(
            UUID companyId,
            UUID userId,
            UUID scheduleEntryId,
            BigDecimal kilometers,
            MultipartFile proofFile
    ) {
        ScheduleEntry entry = requireOwnedEntry(companyId, userId, scheduleEntryId);
        if (entry.getStatus() != ScheduleEntryStatus.CONFIRMED) {
            throw new IllegalArgumentException("Travel claims are only available for accepted shifts");
        }
        Shift shift = requireShift(entry.getShiftId(), companyId);
        if (shift.getEndTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Travel claims can only be submitted after the shift has ended");
        }

        TravelClaim claim = travelClaimRepository.findByScheduleEntryId(scheduleEntryId).orElseGet(TravelClaim::new);
        if (claim.getStatus() == TravelClaimStatus.APPROVED || claim.getStatus() == TravelClaimStatus.AUTO_APPROVED) {
            throw new IllegalArgumentException("This travel claim has already been approved");
        }
        claim.setScheduleEntryId(scheduleEntryId);
        claim.setKilometers(kilometers.setScale(2, RoundingMode.HALF_UP));
        claim.setRatePerKilometer(planningTimesheetExportService.getDefaultTravelRate());
        claim.setTotalAmount(claim.getKilometers().multiply(claim.getRatePerKilometer()).setScale(2, RoundingMode.HALF_UP));
        claim.setSubmittedAt(LocalDateTime.now());
        claim.setReviewedAt(null);
        claim.setReviewedByUserId(null);
        claim.setRejectionNote(null);

        String travelClaimMode = planningTimesheetExportService.getTravelClaimMode(companyId);
        claim.setStatus("AUTO_APPROVE".equals(travelClaimMode) ? TravelClaimStatus.AUTO_APPROVED : TravelClaimStatus.PENDING);

        if (proofFile != null && !proofFile.isEmpty()) {
            validateProofFile(proofFile);
            try {
                claim.setProofImage(proofFile.getBytes());
            } catch (IOException e) {
                throw new IllegalArgumentException("Could not read proof image");
            }
            claim.setProofContentType(proofFile.getContentType());
        }

        travelClaimRepository.save(claim);
        if (Boolean.TRUE.equals(entry.getTimesheetExported())
                && (claim.getStatus() == TravelClaimStatus.AUTO_APPROVED || claim.getStatus() == TravelClaimStatus.APPROVED)) {
            entry.setTimesheetExported(false);
            entry.setTimesheetExportedAt(null);
            scheduleEntryRepository.save(entry);
            planningTimesheetExportService.exportScheduleEntries(companyId, List.of(entry));
        }

        return mapAssignment(entry);
    }

    @Transactional(readOnly = true)
    public ProofImage getTravelProofForEmployee(UUID companyId, UUID userId, UUID scheduleEntryId) {
        requireOwnedEntry(companyId, userId, scheduleEntryId);
        return getProof(scheduleEntryId);
    }

    @Transactional(readOnly = true)
    public List<EmployeePlanningAssignmentDTO> listPendingTravelClaims(UUID companyId) {
        return travelClaimRepository.findByStatusOrderBySubmittedAtAsc(TravelClaimStatus.PENDING).stream()
                .map(TravelClaim::getScheduleEntryId)
                .map(scheduleEntryRepository::findById)
                .flatMap(java.util.Optional::stream)
                .filter(entry -> belongsToCompany(entry, companyId))
                .map(this::mapAssignment)
                .toList();
    }

    @Transactional
    public EmployeePlanningAssignmentDTO reviewTravelClaim(
            UUID companyId,
            UUID reviewerUserId,
            UUID scheduleEntryId,
            TravelClaimStatus status,
            String rejectionNote
    ) {
        if (status != TravelClaimStatus.APPROVED && status != TravelClaimStatus.REJECTED) {
            throw new IllegalArgumentException("Travel claim review must approve or reject the claim");
        }
        ScheduleEntry entry = scheduleEntryRepository.findById(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Travel claim assignment not found"));
        requireShift(entry.getShiftId(), companyId);

        TravelClaim claim = travelClaimRepository.findByScheduleEntryId(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Travel claim not found"));
        claim.setStatus(status);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setReviewedByUserId(reviewerUserId);
        claim.setRejectionNote(status == TravelClaimStatus.REJECTED ? normalizeText(rejectionNote) : null);
        travelClaimRepository.save(claim);

        if (status == TravelClaimStatus.APPROVED && Boolean.TRUE.equals(entry.getTimesheetExported())) {
            entry.setTimesheetExported(false);
            entry.setTimesheetExportedAt(null);
            scheduleEntryRepository.save(entry);
            planningTimesheetExportService.exportScheduleEntries(companyId, List.of(entry));
        }

        return mapAssignment(entry);
    }

    @Transactional(readOnly = true)
    public ProofImage getTravelProofForAdmin(UUID companyId, UUID scheduleEntryId) {
        ScheduleEntry entry = scheduleEntryRepository.findById(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        requireShift(entry.getShiftId(), companyId);
        return getProof(scheduleEntryId);
    }

    private List<EmployeePlanningAssignmentDTO> loadAssignmentsForUser(UUID companyId, UUID userId) {
        return scheduleEntryRepository.findByUserId(userId).stream()
                .filter(entry -> belongsToCompany(entry, companyId))
                .map(this::mapAssignment)
                .toList();
    }

    private boolean belongsToCompany(ScheduleEntry entry, UUID companyId) {
        Shift shift = shiftRepository.findById(entry.getShiftId()).orElse(null);
        if (shift == null) {
            return false;
        }
        Event event = eventRepository.findById(shift.getEventId()).orElse(null);
        return event != null && companyId.equals(event.getCompanyId());
    }

    private boolean matchesScope(EmployeePlanningAssignmentDTO dto, String scope) {
        String normalizedScope = scope == null ? "all" : scope.trim().toLowerCase();
        String status = dto.getStatus() == null ? "" : dto.getStatus().toUpperCase();
        boolean isPast = Boolean.TRUE.equals(dto.getIsPast());

        return switch (normalizedScope) {
            case "pending" -> "ASSIGNED".equals(status) && !isPast;
            case "upcoming" -> "CONFIRMED".equals(status) && !isPast;
            case "past" -> "CONFIRMED".equals(status) && isPast;
            default -> true;
        };
    }

    private ScheduleEntry requireOwnedEntry(UUID companyId, UUID userId, UUID scheduleEntryId) {
        ScheduleEntry entry = scheduleEntryRepository.findById(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        if (!userId.equals(entry.getUserId())) {
            throw new IllegalArgumentException("Assignment not found");
        }
        requireShift(entry.getShiftId(), companyId);
        return entry;
    }

    private Shift requireShift(UUID shiftId, UUID companyId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));
        Event event = eventRepository.findById(shift.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!companyId.equals(event.getCompanyId())) {
            throw new IllegalArgumentException("Shift not found");
        }
        return shift;
    }

    private EmployeePlanningAssignmentDTO mapAssignment(ScheduleEntry entry) {
        Shift shift = shiftRepository.findById(entry.getShiftId())
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));
        Event event = eventRepository.findById(shift.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        TravelClaim claim = travelClaimRepository.findByScheduleEntryId(entry.getScheduleEntryId()).orElse(null);

        EmployeePlanningAssignmentDTO dto = new EmployeePlanningAssignmentDTO();
        dto.setScheduleEntryId(entry.getScheduleEntryId());
        dto.setUserId(entry.getUserId());
        dto.setUserDisplayName(null);
        dto.setEventId(event.getEventId());
        dto.setEventName(event.getName());
        dto.setClientCompanyName(null);
        dto.setEventStartDate(event.getStartDate());
        dto.setEventEndDate(event.getEndDate());
        dto.setInternalDescription(event.getInternalDescription());
        dto.setExternalDescription(event.getExternalDescription());
        dto.setEventLocation(event.getLocation());
        dto.setShiftId(shift.getShiftId());
        dto.setShiftName(shift.getName() == null || shift.getName().isBlank() ? shift.getFunctionName() : shift.getName());
        dto.setShiftDate(shift.getStartTime().toLocalDate());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setBreakMinutes(shift.getBreakMinutes() == null ? 0 : shift.getBreakMinutes());
        dto.setFunctionName(shift.getFunctionName());
        dto.setShiftLocation(shift.getLocation() == null || shift.getLocation().isBlank() ? event.getLocation() : shift.getLocation());
        dto.setStatus(entry.getStatus().name());
        dto.setIsPast(!shift.getEndTime().isAfter(LocalDateTime.now()));
        dto.setTimesheetExported(Boolean.TRUE.equals(entry.getTimesheetExported()));
        dto.setTimesheetExportedAt(entry.getTimesheetExportedAt());
        dto.setTravelClaim(mapTravelClaim(claim));
        return dto;
    }

    private TravelClaimSummaryDTO mapTravelClaim(TravelClaim claim) {
        if (claim == null) {
            return null;
        }
        TravelClaimSummaryDTO dto = new TravelClaimSummaryDTO();
        dto.setKilometers(claim.getKilometers());
        dto.setRatePerKilometer(claim.getRatePerKilometer());
        dto.setTotalAmount(claim.getTotalAmount());
        dto.setStatus(claim.getStatus().name());
        dto.setSubmittedAt(claim.getSubmittedAt());
        dto.setReviewedAt(claim.getReviewedAt());
        dto.setRejectionNote(claim.getRejectionNote());
        dto.setHasProof(claim.getProofImage() != null && claim.getProofImage().length > 0);
        return dto;
    }

    private ProofImage getProof(UUID scheduleEntryId) {
        TravelClaim claim = travelClaimRepository.findByScheduleEntryId(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Travel claim not found"));
        if (claim.getProofImage() == null || claim.getProofImage().length == 0) {
            throw new IllegalArgumentException("No proof image found");
        }
        return new ProofImage(claim.getProofImage(), claim.getProofContentType());
    }

    private void validateProofFile(MultipartFile proofFile) {
        String contentType = proofFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Proof must be an image");
        }
        if (proofFile.getSize() > MAX_PROOF_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Proof image is too large");
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record ProofImage(byte[] data, String contentType) {
    }
}
