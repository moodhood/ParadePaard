package com.pm.planningservice.controller;

import com.pm.planningservice.dto.PlanningAssignmentMutationResponseDTO;
import com.pm.planningservice.dto.PlanningAssignmentSaveRequestDTO;
import com.pm.planningservice.dto.PlanningLocationDTO;
import com.pm.planningservice.dto.PlanningLocationSaveRequestDTO;
import com.pm.planningservice.dto.PlanningProjectMutationResponseDTO;
import com.pm.planningservice.dto.PlanningProjectSaveRequestDTO;
import com.pm.planningservice.dto.PlanningShiftMutationResponseDTO;
import com.pm.planningservice.dto.PlanningShiftSaveRequestDTO;
import com.pm.planningservice.security.PlanningAuthentication;
import com.pm.planningservice.service.PlanningManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/planning")
public class PlanningManagementController {
    private final PlanningManagementService planningManagementService;

    public PlanningManagementController(PlanningManagementService planningManagementService) {
        this.planningManagementService = planningManagementService;
    }

    @GetMapping("/locations")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> listLocations(
            Authentication authentication,
            @RequestParam(required = false) UUID clientCompanyId
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            List<PlanningLocationDTO> response = planningManagementService.listLocations(companyId, clientCompanyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/locations")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> createLocation(
            Authentication authentication,
            @Valid @RequestBody PlanningLocationSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningLocationDTO response = planningManagementService.createLocation(
                    companyId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/locations/{locationId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> updateLocation(
            Authentication authentication,
            @PathVariable UUID locationId,
            @Valid @RequestBody PlanningLocationSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningLocationDTO response = planningManagementService.updateLocation(
                    companyId,
                    locationId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/locations/{locationId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteLocation(
            Authentication authentication,
            @PathVariable UUID locationId,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteLocation(companyId, locationId, PlanningAuthentication.bearerToken(httpRequest));
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/projects")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> createProject(
            Authentication authentication,
            @Valid @RequestBody PlanningProjectSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID userId = PlanningAuthentication.requireUserId(authentication);
            PlanningProjectMutationResponseDTO response = planningManagementService.createProject(
                    companyId,
                    userId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
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
            @Valid @RequestBody PlanningProjectSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningProjectMutationResponseDTO response = planningManagementService.updateProject(
                    companyId,
                    projectId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteProject(
            Authentication authentication,
            @PathVariable UUID projectId,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteProject(companyId, projectId, PlanningAuthentication.bearerToken(httpRequest));
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
            @Valid @RequestBody PlanningShiftSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningShiftMutationResponseDTO response = planningManagementService.createShift(
                    companyId,
                    projectId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
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
            @Valid @RequestBody PlanningShiftSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningShiftMutationResponseDTO response = planningManagementService.updateShift(
                    companyId,
                    shiftId,
                    request,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/shifts/{shiftId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteShift(
            Authentication authentication,
            @PathVariable UUID shiftId,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteShift(companyId, shiftId, PlanningAuthentication.bearerToken(httpRequest));
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
            @Valid @RequestBody PlanningAssignmentSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningAssignmentMutationResponseDTO response =
                    planningManagementService.createAssignment(
                            companyId,
                            shiftId,
                            request,
                            PlanningAuthentication.bearerToken(httpRequest)
                    );
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
            @Valid @RequestBody PlanningAssignmentSaveRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            PlanningAssignmentMutationResponseDTO response =
                    planningManagementService.updateAssignment(
                            companyId,
                            scheduleEntryId,
                            request,
                            PlanningAuthentication.bearerToken(httpRequest)
                    );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/assignments/{scheduleEntryId}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLANNING')")
    public ResponseEntity<?> deleteAssignment(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            planningManagementService.deleteAssignment(
                    companyId,
                    scheduleEntryId,
                    PlanningAuthentication.bearerToken(httpRequest)
            );
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
