package com.pm.payrollservice.controller;

import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.dto.PayslipResponseDTO;
import com.pm.payrollservice.dto.validators.CreatePayslipValidationGroup;
import com.pm.payrollservice.repository.PayslipDocumentRepository;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.service.PayrollService;
import com.pm.payrollservice.service.PayslipPdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.groups.Default;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payroll")
@Tag(name = "Payroll", description = "API for managing payroll service")
public class PayrollController {
    private final PayrollService payrollService;
    private final PayslipRepository payslipRepository;
    private final PayslipDocumentRepository docRepo; // keep if you use it elsewhere
    private final PayslipPdfService pdfService;

    public PayrollController(PayrollService payrollService,
                             PayslipRepository payslipRepository,
                             PayslipDocumentRepository docRepo,
                             PayslipPdfService pdfService) {
        this.payrollService = payrollService;
        this.payslipRepository = payslipRepository;
        this.docRepo = docRepo;
        this.pdfService = pdfService;
    }

    private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

    @GetMapping
    @Operation(summary = "Get all payslips admin only")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PayslipResponseDTO>> getPayslips() {
        List<PayslipResponseDTO> payslips = payrollService.getPayslips();
        return ResponseEntity.ok().body(payslips);
    }

    /* changed: return pdf for a single payslip */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Get a payslip by id as PDF self or admin")
    @PreAuthorize("hasAuthority('ADMIN') or @payrollPermission.isOwner(#id, authentication)")
    public ResponseEntity<byte[]> getPayslipPdf(@PathVariable UUID id) {
        byte[] pdf = payrollService.generatePayslipPdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"payslip_" + id + ".pdf\"");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    /* optional: keep json route for api use or debugging */
    @GetMapping(value = "/{id}/json", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get a payslip as JSON self or admin")
    @PreAuthorize("hasAuthority('ADMIN') or @payrollPermission.isOwner(#id, authentication)")
    public ResponseEntity<PayslipResponseDTO> getPayslipJson(@PathVariable UUID id) {
        return ResponseEntity.ok(payrollService.getPayslipById(id));
    }

    /* optional: preview html in browser */
    @GetMapping(value = "/{id}/html", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Render payslip as HTML self or admin")
    @PreAuthorize("hasAuthority('ADMIN') or @payrollPermission.isOwner(#id, authentication)")
    public ResponseEntity<String> renderHtml(@PathVariable UUID id) {
        String html = payrollService.renderPayslipHtml(id);
        return ResponseEntity.ok(html);
    }

    @PostMapping
    @Operation(summary = "Create new payslip admin only")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayslipResponseDTO> createPayslip(
            @Validated({Default.class, CreatePayslipValidationGroup.class})
            @RequestBody PayslipRequestDTO payslipRequestDTO) {
        PayslipResponseDTO payslipResponseDTO = payrollService.createPayslip(payslipRequestDTO);
        return ResponseEntity.ok().body(payslipResponseDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payslip admin only")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PayslipResponseDTO> updatePayslip(
            @PathVariable UUID id,
            @Validated({Default.class}) @RequestBody PayslipRequestDTO payslipRequestDTO) {
        PayslipResponseDTO payslipResponseDTO = payrollService.updatePayslip(id, payslipRequestDTO);
        return ResponseEntity.ok().body(payslipResponseDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payslip admin only")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePayslip(@PathVariable UUID id) {
        payrollService.deletePayslip(id);
        return ResponseEntity.noContent().build();
    }
}
