package com.pm.planningservice.controller;

import com.pm.planningservice.dto.TravelClaimReviewRequestDTO;
import com.pm.planningservice.security.PlanningAuthentication;
import com.pm.planningservice.service.EmployeePlanningService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/planning/travel-claims")
public class PlanningTravelClaimAdminController {
    private final EmployeePlanningService employeePlanningService;

    public PlanningTravelClaimAdminController(EmployeePlanningService employeePlanningService) {
        this.employeePlanningService = employeePlanningService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('CAN_MANAGE_TIMESHEETS')")
    public ResponseEntity<?> listPendingClaims(Authentication authentication) {
        UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
        return ResponseEntity.ok(employeePlanningService.listPendingTravelClaims(companyId));
    }

    @PutMapping("/{scheduleEntryId}/review")
    @PreAuthorize("hasAuthority('CAN_MANAGE_TIMESHEETS')")
    public ResponseEntity<?> reviewClaim(
            Authentication authentication,
            @PathVariable UUID scheduleEntryId,
            @Valid @RequestBody TravelClaimReviewRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            UUID reviewerUserId = PlanningAuthentication.requireUserId(authentication);
            return ResponseEntity.ok(employeePlanningService.reviewTravelClaim(
                    companyId,
                    reviewerUserId,
                    scheduleEntryId,
                    request.getStatus(),
                    request.getRejectionNote(),
                    PlanningAuthentication.bearerToken(httpRequest)
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/{scheduleEntryId}/proof")
    @PreAuthorize("hasAuthority('CAN_MANAGE_TIMESHEETS')")
    public ResponseEntity<?> getClaimProof(Authentication authentication, @PathVariable UUID scheduleEntryId) {
        try {
            UUID companyId = PlanningAuthentication.requireCompanyId(authentication);
            EmployeePlanningService.ProofImage proof = employeePlanningService.getTravelProofForAdmin(companyId, scheduleEntryId);
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
