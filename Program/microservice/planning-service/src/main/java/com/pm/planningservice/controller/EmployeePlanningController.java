package com.pm.planningservice.controller;

import com.pm.planningservice.dto.EmployeePlanningAssignmentDTO;
import com.pm.planningservice.dto.EmployeeShiftResponseRequestDTO;
import com.pm.planningservice.dto.TravelClaimSaveRequestDTO;
import com.pm.planningservice.security.PlanningAuthentication;
import com.pm.planningservice.service.EmployeePlanningService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/planning/me")
public class EmployeePlanningController {
    private final EmployeePlanningService employeePlanningService;

    public EmployeePlanningController(EmployeePlanningService employeePlanningService) {
        this.employeePlanningService = employeePlanningService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING') or hasAuthority('CAN_VIEW_OWN_TIMESHEETS')")
    public ResponseEntity<List<EmployeePlanningAssignmentDTO>> getMyPlanning(
            Authentication authentication,
            @RequestParam(defaultValue = "all") String scope
    ) {
        UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
        UUID userId = PlanningAuthentication.requireUserId(authentication);
        return ResponseEntity.ok(employeePlanningService.getMyAssignments(companyId, userId, scope));
    }

    @GetMapping("/assignments/{scheduleEntryId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING') or hasAuthority('CAN_VIEW_OWN_TIMESHEETS')")
    public ResponseEntity<?> getMyPlanningAssignment(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            return ResponseEntity.ok(employeePlanningService.getMyAssignmentDetail(companyId, userId, scheduleEntryId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/assignments/{scheduleEntryId}/response")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING') or hasAuthority('CAN_VIEW_OWN_TIMESHEETS')")
    public ResponseEntity<?> respondToShift(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId,
            @Valid @org.springframework.web.bind.annotation.RequestBody EmployeeShiftResponseRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            return ResponseEntity.ok(employeePlanningService.respondToAssignment(companyId, userId, scheduleEntryId, request.getStatus()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping(value = "/assignments/{scheduleEntryId}/travel-claim", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING') or hasAuthority('CAN_VIEW_OWN_TIMESHEETS')")
    public ResponseEntity<?> submitTravelClaim(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId,
            @Valid @ModelAttribute TravelClaimSaveRequestDTO request,
            @RequestParam(name = "file", required = false) MultipartFile file
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            return ResponseEntity.ok(employeePlanningService.saveTravelClaim(companyId, userId, scheduleEntryId, request.getKilometers(), file));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/assignments/{scheduleEntryId}/travel-proof")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING') or hasAuthority('CAN_VIEW_OWN_TIMESHEETS')")
    public ResponseEntity<?> getTravelProof(Authentication authentication, @PathVariable UUID scheduleEntryId) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            EmployeePlanningService.ProofImage proof = employeePlanningService.getTravelProofForEmployee(companyId, userId, scheduleEntryId);
            MediaType mediaType = proof.contentType() == null || proof.contentType().isBlank()
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(proof.contentType());
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noStore())
                    .contentType(mediaType)
                    .body(proof.data());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
