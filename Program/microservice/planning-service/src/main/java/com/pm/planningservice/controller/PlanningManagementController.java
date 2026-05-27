package com.pm.planningservice.controller;

import com.pm.planningservice.dto.PlanningAssignmentMutationResponseDTO;
import com.pm.planningservice.dto.PlanningAssignmentSaveRequestDTO;
import com.pm.planningservice.dto.PlanningProjectMutationResponseDTO;
import com.pm.planningservice.dto.PlanningProjectSaveRequestDTO;
import com.pm.planningservice.dto.PlanningShiftMutationResponseDTO;
import com.pm.planningservice.dto.PlanningShiftSaveRequestDTO;
import com.pm.planningservice.security.PlanningAuthentication;
import com.pm.planningservice.service.PlanningManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/planning")
public class PlanningManagementController {
    private final PlanningManagementService planningManagementService;

    public PlanningManagementController(PlanningManagementService planningManagementService) {
        this.planningManagementService = planningManagementService;
    }

    @PostMapping("/projects")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> createProject(
            Authentication authentication,
            @Valid @RequestBody PlanningProjectSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            PlanningProjectMutationResponseDTO response = planningManagementService.createProject(companyId, userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/projects/{projectId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> updateProject(
            Authentication authentication,
            @PathVariable UUID projectId,
            @Valid @RequestBody PlanningProjectSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningProjectMutationResponseDTO response = planningManagementService.updateProject(companyId, projectId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteProject(Authentication authentication, @PathVariable UUID projectId) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteProject(companyId, projectId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/projects/{projectId}/shifts")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> createShift(
            Authentication authentication,
            @PathVariable UUID projectId,
            @Valid @RequestBody PlanningShiftSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningShiftMutationResponseDTO response = planningManagementService.createShift(companyId, projectId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/shifts/{shiftId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> updateShift(
            Authentication authentication,
            @PathVariable UUID shiftId,
            @Valid @RequestBody PlanningShiftSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningShiftMutationResponseDTO response = planningManagementService.updateShift(companyId, shiftId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/shifts/{shiftId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteShift(Authentication authentication, @PathVariable UUID shiftId) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteShift(companyId, shiftId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/shifts/{shiftId}/assignments")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> createAssignment(
            Authentication authentication,
            @PathVariable UUID shiftId,
            @Valid @RequestBody PlanningAssignmentSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningAssignmentMutationResponseDTO response =
                    planningManagementService.createAssignment(companyId, shiftId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/assignments/{scheduleEntryId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> updateAssignment(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId,
            @Valid @RequestBody PlanningAssignmentSaveRequestDTO request
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningAssignmentMutationResponseDTO response =
                    planningManagementService.updateAssignment(companyId, scheduleEntryId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/assignments/{scheduleEntryId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteAssignment(Authentication authentication, @PathVariable UUID scheduleEntryId) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteAssignment(companyId, scheduleEntryId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
