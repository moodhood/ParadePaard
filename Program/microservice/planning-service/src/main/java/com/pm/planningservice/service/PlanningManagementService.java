package com.pm.planningservice.service;

import com.pm.planningservice.dto.PlanningAssignmentMutationResponseDTO;
import com.pm.planningservice.dto.PlanningAssignmentSaveRequestDTO;
import com.pm.planningservice.dto.PlanningClientCompanyDTO;
import com.pm.planningservice.dto.PlanningClientCompanyContactDTO;
import com.pm.planningservice.dto.PlanningClientCompanyContactSaveRequestDTO;
import com.pm.planningservice.dto.PlanningClientCompanySaveRequestDTO;
import com.pm.planningservice.dto.PagedResponseDTO;
import com.pm.planningservice.dto.PlanningProjectMutationResponseDTO;
import com.pm.planningservice.dto.PlanningProjectSaveRequestDTO;
import com.pm.planningservice.dto.PlanningShiftMutationResponseDTO;
import com.pm.planningservice.dto.PlanningShiftSaveRequestDTO;
import com.pm.planningservice.model.ClientCompany;
import com.pm.planningservice.model.ClientCompanyContact;
import com.pm.planningservice.model.Project;
import com.pm.planningservice.model.ScheduleEntry;
import com.pm.planningservice.model.ScheduleEntryStatus;
import com.pm.planningservice.model.Shift;
import com.pm.planningservice.repository.ClientCompanyRepository;
import com.pm.planningservice.repository.ProjectRepository;
import com.pm.planningservice.repository.ScheduleEntryRepository;
import com.pm.planningservice.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class PlanningManagementService {
    private static final String DEFAULT_PROJECT_STATUS = "DRAFT";
    private static final int MAX_CLIENT_PROFILE_PICTURE_LENGTH = 800_000;

    private final ClientCompanyRepository clientCompanyRepository;
    private final ProjectRepository projectRepository;
    private final ShiftRepository shiftRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;

    public PlanningManagementService(
            ClientCompanyRepository clientCompanyRepository,
            ProjectRepository projectRepository,
            ShiftRepository shiftRepository,
            ScheduleEntryRepository scheduleEntryRepository
    ) {
        this.clientCompanyRepository = clientCompanyRepository;
        this.projectRepository = projectRepository;
        this.shiftRepository = shiftRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
    }

    @Transactional
    public PlanningClientCompanyDTO createClientCompany(UUID companyId, PlanningClientCompanySaveRequestDTO request) {
        String name = normalizeRequiredText(request.getName(), "Client company name is required");
        if (clientCompanyRepository.existsByOwnerCompanyIdAndNameIgnoreCase(companyId, name)) {
            throw new IllegalArgumentException("A client company with this name already exists");
        }

        ClientCompany clientCompany = new ClientCompany();
        clientCompany.setOwnerCompanyId(companyId);
        clientCompany.setName(name);
        clientCompany.setAddress(normalizeOptionalText(request.getAddress()));
        clientCompany.setCompanyLine(normalizeOptionalText(request.getCompanyLine()));
        clientCompany.setNotes(normalizeOptionalText(request.getNotes()));
        clientCompany.setProfilePictureUrl(normalizeClientProfilePicture(request.getProfilePictureUrl()));
        clientCompany.setContacts(normalizeContacts(request.getContacts()));
        clientCompany.setCreatedAt(LocalDateTime.now());
        return toClientCompanyDto(clientCompanyRepository.save(clientCompany));
    }

    @Transactional
    public PlanningClientCompanyDTO updateClientCompany(
            UUID companyId,
            UUID clientCompanyId,
            PlanningClientCompanySaveRequestDTO request
    ) {
        ClientCompany clientCompany = clientCompanyRepository
                .findByClientCompanyIdAndOwnerCompanyId(clientCompanyId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Client company not found"));

        String name = normalizeRequiredText(request.getName(), "Client company name is required");
        if (clientCompanyRepository.existsByOwnerCompanyIdAndNameIgnoreCaseAndClientCompanyIdNot(
                companyId,
                name,
                clientCompanyId
        )) {
            throw new IllegalArgumentException("A client company with this name already exists");
        }

        clientCompany.setName(name);
        clientCompany.setAddress(normalizeOptionalText(request.getAddress()));
        clientCompany.setCompanyLine(normalizeOptionalText(request.getCompanyLine()));
        clientCompany.setNotes(normalizeOptionalText(request.getNotes()));
        clientCompany.setProfilePictureUrl(normalizeClientProfilePicture(request.getProfilePictureUrl()));
        clientCompany.setContacts(normalizeContacts(request.getContacts()));
        return toClientCompanyDto(clientCompanyRepository.save(clientCompany));
    }

    @Transactional(readOnly = true)
    public List<PlanningClientCompanyDTO> listClientCompanies(UUID companyId) {
        return clientCompanyRepository.findByOwnerCompanyIdOrderByNameAsc(companyId).stream()
                .map(this::toClientCompanyDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<PlanningClientCompanyDTO> listClientCompaniesPage(UUID companyId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name", "createdAt"));
        var companies = clientCompanyRepository.findByOwnerCompanyId(companyId, pageable);
        return PagedResponseDTO.from(companies, this::toClientCompanyDto);
    }

    @Transactional
    public PlanningProjectMutationResponseDTO createProject(UUID companyId, UUID userId, PlanningProjectSaveRequestDTO request) {
        validateProjectRequest(companyId, request);

        Project project = new Project();
        project.setCompanyId(companyId);
        project.setClientCompanyId(resolveClientCompanyId(companyId, request.getClientCompanyId()));
        project.setName(normalizeRequiredText(request.getName(), "Project name is required"));
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setInternalDescription(normalizeOptionalText(request.getInternalDescription()));
        project.setExternalDescription(normalizeOptionalText(request.getExternalDescription()));
        project.setDefaultStartTime(request.getDefaultStartTime());
        project.setDefaultEndTime(request.getDefaultEndTime());
        project.setProjectTimezone(PlanningTimeZoneSupport.normalizeProjectTimezone(request.getProjectTimezone()));
        project.setLocation(normalizeOptionalText(request.getLocation()));
        project.setStatus(normalizeProjectStatus(request.getStatus()));
        project.setCreatedByUserId(userId);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setFinalized(false);
        project.setFinalizedAt(null);

        Project saved = projectRepository.save(project);
        PlanningProjectMutationResponseDTO response = new PlanningProjectMutationResponseDTO();
        response.setProjectId(saved.getProjectId());
        return response;
    }

    @Transactional
    public PlanningProjectMutationResponseDTO updateProject(UUID companyId, UUID projectId, PlanningProjectSaveRequestDTO request) {
        validateProjectRequest(companyId, request);

        Project project = requireEditableProject(companyId, projectId);
        List<Shift> existingShifts = shiftRepository.findByProjectId(projectId);
        boolean hasOutOfRangeShift = existingShifts.stream()
                .anyMatch(shift -> !isWithinProjectRange(shift.getStartTime(), shift.getEndTime(), request.getStartDate(), request.getEndDate()));
        if (hasOutOfRangeShift) {
            throw new IllegalArgumentException("Existing shifts fall outside the new project date range");
        }

        project.setClientCompanyId(resolveClientCompanyId(companyId, request.getClientCompanyId()));
        project.setName(normalizeRequiredText(request.getName(), "Project name is required"));
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setInternalDescription(normalizeOptionalText(request.getInternalDescription()));
        project.setExternalDescription(normalizeOptionalText(request.getExternalDescription()));
        project.setDefaultStartTime(request.getDefaultStartTime());
        project.setDefaultEndTime(request.getDefaultEndTime());
        project.setProjectTimezone(PlanningTimeZoneSupport.normalizeProjectTimezone(request.getProjectTimezone()));
        project.setLocation(normalizeOptionalText(request.getLocation()));
        project.setStatus(normalizeProjectStatus(request.getStatus()));
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        PlanningProjectMutationResponseDTO response = new PlanningProjectMutationResponseDTO();
        response.setProjectId(project.getProjectId());
        return response;
    }

    @Transactional
    public void deleteProject(UUID companyId, UUID projectId) {
        Project project = requireEditableProject(companyId, projectId);
        List<Shift> shifts = shiftRepository.findByProjectId(projectId);
        deleteShiftChildren(shifts);
        shiftRepository.deleteAll(shifts);
        projectRepository.delete(project);
    }

    @Transactional
    public PlanningShiftMutationResponseDTO createShift(UUID companyId, UUID projectId, PlanningShiftSaveRequestDTO request) {
        Project project = requireEditableProject(companyId, projectId);
        validateShift(project, request);

        Shift shift = new Shift();
        shift.setProjectId(project.getProjectId());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setName(normalizeOptionalText(request.getName()));
        shift.setBreakMinutes(resolveBreakMinutes(request.getBreakMinutes()));
        shift.setLocation(normalizeOptionalText(request.getLocation()));
        shift.setPeopleNeeded(resolvePeopleNeeded(request.getPeopleNeeded()));
        shift.setFunctionName(normalizeRequiredText(request.getFunctionName(), "Job function is required"));

        Shift saved = shiftRepository.save(shift);
        PlanningShiftMutationResponseDTO response = new PlanningShiftMutationResponseDTO();
        response.setShiftId(saved.getShiftId());
        response.setProjectId(project.getProjectId());
        return response;
    }

    @Transactional
    public PlanningShiftMutationResponseDTO updateShift(UUID companyId, UUID shiftId, PlanningShiftSaveRequestDTO request) {
        Shift shift = requireShift(shiftId);
        Project project = requireEditableProject(companyId, shift.getProjectId());
        validateShift(project, request);

        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setName(normalizeOptionalText(request.getName()));
        shift.setBreakMinutes(resolveBreakMinutes(request.getBreakMinutes()));
        shift.setLocation(normalizeOptionalText(request.getLocation()));
        shift.setPeopleNeeded(resolvePeopleNeeded(request.getPeopleNeeded()));
        shift.setFunctionName(normalizeRequiredText(request.getFunctionName(), "Job function is required"));
        shiftRepository.save(shift);

        PlanningShiftMutationResponseDTO response = new PlanningShiftMutationResponseDTO();
        response.setShiftId(shift.getShiftId());
        response.setProjectId(project.getProjectId());
        return response;
    }

    @Transactional
    public void deleteShift(UUID companyId, UUID shiftId) {
        Shift shift = requireShift(shiftId);
        requireEditableProject(companyId, shift.getProjectId());
        deleteShiftChildren(List.of(shift));
        shiftRepository.delete(shift);
    }

    @Transactional
    public PlanningAssignmentMutationResponseDTO createAssignment(
            UUID companyId,
            UUID shiftId,
            PlanningAssignmentSaveRequestDTO request
    ) {
        Shift shift = requireShift(shiftId);
        requireEditableProject(companyId, shift.getProjectId());
        UUID userId = Objects.requireNonNull(request.getUserId(), "User id is required");
        ScheduleEntryStatus requestedStatus = resolveStatus(request.getStatus());
        ScheduleEntry existingEntry = scheduleEntryRepository.findFirstByShiftIdAndUserId(shiftId, userId).orElse(null);
        if (existingEntry != null) {
            existingEntry.setStatus(requestedStatus);
            existingEntry.setTimesheetExported(false);
            existingEntry.setTimesheetExportedAt(null);
            scheduleEntryRepository.save(existingEntry);

            PlanningAssignmentMutationResponseDTO existingResponse = new PlanningAssignmentMutationResponseDTO();
            existingResponse.setScheduleEntryId(existingEntry.getScheduleEntryId());
            existingResponse.setShiftId(shift.getShiftId());
            return existingResponse;
        }

        ScheduleEntry scheduleEntry = new ScheduleEntry();
        scheduleEntry.setShiftId(shiftId);
        scheduleEntry.setUserId(userId);
        scheduleEntry.setStatus(requestedStatus);
        scheduleEntry.setTimesheetExported(false);
        scheduleEntry.setTimesheetExportedAt(null);
        ScheduleEntry saved = scheduleEntryRepository.save(scheduleEntry);

        PlanningAssignmentMutationResponseDTO response = new PlanningAssignmentMutationResponseDTO();
        response.setScheduleEntryId(saved.getScheduleEntryId());
        response.setShiftId(shift.getShiftId());
        return response;
    }

    @Transactional
    public PlanningAssignmentMutationResponseDTO updateAssignment(
            UUID companyId,
            UUID scheduleEntryId,
            PlanningAssignmentSaveRequestDTO request
    ) {
        ScheduleEntry scheduleEntry = requireScheduleEntry(scheduleEntryId);
        Shift shift = requireShift(scheduleEntry.getShiftId());
        requireEditableProject(companyId, shift.getProjectId());
        ensureAssignmentAbsent(shift.getShiftId(), request.getUserId(), scheduleEntry.getScheduleEntryId());

        scheduleEntry.setUserId(request.getUserId());
        scheduleEntry.setStatus(resolveStatus(request.getStatus()));
        scheduleEntry.setTimesheetExported(false);
        scheduleEntry.setTimesheetExportedAt(null);
        scheduleEntryRepository.save(scheduleEntry);

        PlanningAssignmentMutationResponseDTO response = new PlanningAssignmentMutationResponseDTO();
        response.setScheduleEntryId(scheduleEntry.getScheduleEntryId());
        response.setShiftId(shift.getShiftId());
        return response;
    }

    @Transactional
    public void deleteAssignment(UUID companyId, UUID scheduleEntryId) {
        ScheduleEntry scheduleEntry = requireScheduleEntry(scheduleEntryId);
        Shift shift = requireShift(scheduleEntry.getShiftId());
        requireEditableProject(companyId, shift.getProjectId());
        scheduleEntryRepository.delete(scheduleEntry);
    }

    private Project requireEditableProject(UUID companyId, UUID projectId) {
        Project project = projectRepository.findByProjectIdAndCompanyId(projectId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Planning project not found"));
        if (Boolean.TRUE.equals(project.getFinalized())) {
            throw new IllegalArgumentException("Finalized projects can no longer be changed");
        }
        return project;
    }

    private Shift requireShift(UUID shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));
    }

    private ScheduleEntry requireScheduleEntry(UUID scheduleEntryId) {
        return scheduleEntryRepository.findById(scheduleEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
    }

    private void validateProjectRequest(UUID companyId, PlanningProjectSaveRequestDTO request) {
        validateProjectDates(request.getStartDate(), request.getEndDate());
        validateDefaultTimes(request.getDefaultStartTime(), request.getDefaultEndTime());
        PlanningTimeZoneSupport.normalizeProjectTimezone(request.getProjectTimezone());
        if (request.getClientCompanyId() != null) {
            resolveClientCompanyId(companyId, request.getClientCompanyId());
        }
    }

    private void validateProjectDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Project start and end dates are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Project end date cannot be before the start date");
        }
    }

    private void validateDefaultTimes(java.time.LocalTime defaultStartTime, java.time.LocalTime defaultEndTime) {
        if (defaultStartTime == null && defaultEndTime == null) {
            return;
        }
        if (defaultStartTime == null || defaultEndTime == null) {
            throw new IllegalArgumentException("Default start and end time must both be provided");
        }
        if (!defaultEndTime.isAfter(defaultStartTime)) {
            throw new IllegalArgumentException("Default project end time must be after the start time");
        }
    }

    private void validateShift(Project project, PlanningShiftSaveRequestDTO request) {
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Shift start and end times are required");
        }
        if (request.getFunctionName() == null || request.getFunctionName().trim().isEmpty()) {
            throw new IllegalArgumentException("Job function is required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Shift end time must be after the start time");
        }
        if (resolveBreakMinutes(request.getBreakMinutes()) < 0) {
            throw new IllegalArgumentException("Break time cannot be negative");
        }
        if (resolvePeopleNeeded(request.getPeopleNeeded()) < 1) {
            throw new IllegalArgumentException("At least one person is required per shift");
        }
        if (!isWithinProjectRange(startTime, endTime, project.getStartDate(), project.getEndDate())) {
            throw new IllegalArgumentException("Shift must stay within the selected project date range");
        }
    }

    private boolean isWithinProjectRange(
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDate shiftStartDate = startTime.toLocalDate();
        LocalDate shiftEndDate = endTime.toLocalDate();
        return !shiftStartDate.isBefore(startDate) && !shiftEndDate.isAfter(endDate);
    }

    private void ensureAssignmentAbsent(UUID shiftId, UUID userId, UUID currentScheduleEntryId) {
        boolean duplicate = scheduleEntryRepository.findByShiftId(shiftId).stream()
                .anyMatch(entry -> userId.equals(entry.getUserId())
                        && (currentScheduleEntryId == null || !currentScheduleEntryId.equals(entry.getScheduleEntryId())));
        if (duplicate) {
            throw new IllegalArgumentException("This employee is already assigned to the selected shift");
        }
    }

    private ScheduleEntryStatus resolveStatus(ScheduleEntryStatus status) {
        return status == null ? ScheduleEntryStatus.ASSIGNED : status;
    }

    private PlanningClientCompanyDTO toClientCompanyDto(ClientCompany clientCompany) {
        PlanningClientCompanyDTO dto = new PlanningClientCompanyDTO();
        dto.setClientCompanyId(clientCompany.getClientCompanyId());
        dto.setName(clientCompany.getName());
        dto.setAddress(clientCompany.getAddress());
        dto.setCompanyLine(clientCompany.getCompanyLine());
        dto.setNotes(clientCompany.getNotes());
        dto.setProfilePictureUrl(clientCompany.getProfilePictureUrl());
        dto.setContacts(clientCompany.getContacts().stream()
                .map(this::toClientCompanyContactDto)
                .toList());
        dto.setCreatedAt(clientCompany.getCreatedAt());
        return dto;
    }

    private PlanningClientCompanyContactDTO toClientCompanyContactDto(ClientCompanyContact contact) {
        PlanningClientCompanyContactDTO dto = new PlanningClientCompanyContactDTO();
        dto.setFirstName(contact.getFirstName());
        dto.setLastName(contact.getLastName());
        dto.setPosition(contact.getPosition());
        dto.setEmail(contact.getEmail());
        dto.setPhone(contact.getPhone());
        return dto;
    }

    private List<ClientCompanyContact> normalizeContacts(List<PlanningClientCompanyContactSaveRequestDTO> contacts) {
        if (contacts == null || contacts.isEmpty()) {
            return new ArrayList<>();
        }

        return contacts.stream()
                .map(this::normalizeContact)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private ClientCompanyContact normalizeContact(PlanningClientCompanyContactSaveRequestDTO request) {
        if (request == null) {
            return null;
        }

        String firstName = normalizeOptionalText(request.getFirstName());
        String lastName = normalizeOptionalText(request.getLastName());
        String position = normalizeOptionalText(request.getPosition());
        String email = normalizeOptionalText(request.getEmail());
        String phone = normalizeOptionalText(request.getPhone());

        if (firstName == null && lastName == null && position == null && email == null && phone == null) {
            return null;
        }

        ClientCompanyContact contact = new ClientCompanyContact();
        contact.setFirstName(firstName);
        contact.setLastName(lastName);
        contact.setPosition(position);
        contact.setEmail(email);
        contact.setPhone(phone);
        return contact;
    }

    private UUID resolveClientCompanyId(UUID companyId, UUID clientCompanyId) {
        if (clientCompanyId == null) {
            return null;
        }
        return clientCompanyRepository.findByClientCompanyIdAndOwnerCompanyId(clientCompanyId, companyId)
                .map(ClientCompany::getClientCompanyId)
                .orElseThrow(() -> new IllegalArgumentException("Selected client company was not found"));
    }

    private String normalizeRequiredText(String value, String message) {
        String normalized = normalizeOptionalText(value);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeClientProfilePicture(String value) {
        String normalized = normalizeOptionalText(value);
        if (normalized == null) {
            return null;
        }
        if (!normalized.startsWith("data:image/")) {
            throw new IllegalArgumentException("Client profile picture must be an image");
        }
        if (normalized.length() > MAX_CLIENT_PROFILE_PICTURE_LENGTH) {
            throw new IllegalArgumentException("Client profile picture is too large");
        }
        return normalized;
    }

    private String normalizeProjectStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DEFAULT_PROJECT_STATUS;
        }
        return value.trim().toUpperCase();
    }

    private int resolveBreakMinutes(Integer value) {
        return value == null ? 0 : value;
    }

    private int resolvePeopleNeeded(Integer value) {
        return value == null ? 1 : value;
    }

    private void deleteShiftChildren(List<Shift> shifts) {
        List<UUID> shiftIds = shifts.stream().map(Shift::getShiftId).toList();
        if (shiftIds.isEmpty()) {
            return;
        }
        List<ScheduleEntry> scheduleEntries = scheduleEntryRepository.findByShiftIdIn(shiftIds);
        if (!scheduleEntries.isEmpty()) {
            scheduleEntryRepository.deleteAll(scheduleEntries);
        }
    }
}
