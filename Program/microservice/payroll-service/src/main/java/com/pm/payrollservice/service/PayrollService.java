package com.pm.payrollservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.dto.PayslipResponseDTO;
import com.pm.payrollservice.exception.PayslipNotFoundException;
import com.pm.payrollservice.grpc.ContractServiceGrpcClient;
import com.pm.payrollservice.grpc.TimesheetServiceGrpcClient;
import com.pm.payrollservice.grpc.UserServiceGrpcClient;
import com.pm.payrollservice.mapper.PayslipMapper;
import com.pm.payrollservice.model.Payslip;
import com.pm.payrollservice.repository.PayslipRepository;
import contract.ContractDataResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import timesheet.TimesheetDataResponse;
import user.UserDataResponse;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PayrollService {
    private final PayslipRepository payslipRepository;
    private final com.pm.payrollservice.validation.PayslipValidator duplicateValidator;
    private final UserServiceGrpcClient userServiceGrpcClient;
    private final ContractServiceGrpcClient contractServiceGrpcClient;
    private final TimesheetServiceGrpcClient timesheetServiceGrpcClient;
    private final PayslipPdfService pdfService;
    private final ObjectMapper objectMapper;

    public PayrollService(PayslipRepository payslipRepository,
                          com.pm.payrollservice.validation.PayslipValidator duplicateValidator,
                          UserServiceGrpcClient userServiceGrpcClient,
                          ContractServiceGrpcClient contractServiceGrpcClient,
                          TimesheetServiceGrpcClient timesheetServiceGrpcClient,
                          PayslipPdfService pdfService,
                          ObjectMapper objectMapper) {
        this.payslipRepository = payslipRepository;
        this.duplicateValidator = duplicateValidator;
        this.userServiceGrpcClient = userServiceGrpcClient;
        this.contractServiceGrpcClient = contractServiceGrpcClient;
        this.timesheetServiceGrpcClient = timesheetServiceGrpcClient;
        this.pdfService = pdfService;
        this.objectMapper = objectMapper;
    }

    public List<PayslipResponseDTO> getPayslips() {
        return payslipRepository.findAll().stream().map(PayslipMapper::toDTO).toList();
    }

    public PayslipResponseDTO getPayslipById(UUID id) {
        Payslip payslip = payslipRepository.findById(id)
                .orElseThrow(() -> new PayslipNotFoundException("Payslip with id: " + id + " not found"));
        return PayslipMapper.toDTO(payslip);
    }

    public PayslipResponseDTO createPayslip(PayslipRequestDTO req) {
        LocalDate date = LocalDate.parse(req.getDateOfIssue());
        UUID userId = UUID.fromString(req.getUserId());

        duplicateValidator.validateNoDuplicate(userId, date);

        Payslip payslip = PayslipMapper.toModel(req);
        payslip.setWeekNumber(date.get(WeekFields.ISO.weekOfWeekBasedYear()));
        payslip.setWeekBasedYear(date.get(WeekFields.ISO.weekBasedYear()));

        UserDataResponse userData = userServiceGrpcClient.requestUserData(userId.toString());
        PayslipMapper.updateFromUserData(payslip, userData);

        ContractDataResponse contractData = contractServiceGrpcClient.requestContractData(userId.toString());
        TimesheetDataResponse timesheetData = timesheetServiceGrpcClient.requestTimesheetData(
                userId.toString(), payslip.getWeekNumber(), payslip.getWeekBasedYear());
        PayslipMapper.updateFromContractDataAndTimesheetData(payslip, contractData, timesheetData);

        PayslipCalculator.apply(payslip);

        payslip = payslipRepository.save(payslip);
        return PayslipMapper.toDTO(payslip);
    }

    public PayslipResponseDTO updatePayslip(UUID id, PayslipRequestDTO req) {
        Payslip payslip = payslipRepository.findById(id)
                .orElseThrow(() -> new PayslipNotFoundException("Payslip with id: " + id + " not found"));

        payslip.setUserId(UUID.fromString(req.getUserId()));
        payslip.setDateOfIssue(LocalDate.parse(req.getDateOfIssue()));

        payslip = payslipRepository.save(payslip);
        return PayslipMapper.toDTO(payslip);
    }

    public void deletePayslip(UUID id) {
        payslipRepository.deleteById(id);
    }

    /* html preview that keeps the client script, useful for manual viewing */
    public String renderPayslipHtml(UUID id) {
        PayslipResponseDTO dto = getPayslipById(id);
        String json;
        try {
            json = objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("could not serialize dto", e);
        }
        String template = loadTemplate("templates/payslip.html");
        return template.replace("__PAYSLIP_JSON__", json);
    }

    /* server filled html for pdf, no script */
    private String renderPayslipHtmlForPdf(UUID id) {
        PayslipResponseDTO dto = getPayslipById(id);
        String template = loadTemplate("templates/payslip_pdf.html");

        NumberFormat eur = NumberFormat.getCurrencyInstance(new Locale("nl", "NL"));

        StringBuilder lines = new StringBuilder();
        if (dto.getTimesheet() != null) {
            dto.getTimesheet().forEach(line -> {
                BigDecimal hours = safe(line.getHoursWorked());
                BigDecimal rate = safe(line.getHourlyWage());
                BigDecimal travel = safe(line.getTravelExpenses());
                BigDecimal total = hours.multiply(rate).add(travel);

                lines.append("<tr>")
                        .append("<td>")
                        .append(escape(line.getFunctionName()))
                        .append("<div class=\"muted\" style=\"font-size:12px;\">")
                        .append(line.getTimesheetId() != null ? "Timesheet " + line.getTimesheetId() : "")
                        .append(line.getDateOfIssue() != null ? " • " + line.getDateOfIssue() : "")
                        .append("</div>")
                        .append("</td>")
                        .append("<td class=\"num\">").append(formatHours(hours)).append("</td>")
                        .append("<td class=\"num\">").append(eur.format(rate)).append("</td>")
                        .append("<td class=\"num\">").append(eur.format(travel)).append("</td>")
                        .append("<td class=\"num\">").append(eur.format(total)).append("</td>")
                        .append("</tr>");
            });
        }

        String address = String.join(" ",
                orEmpty(dto.getStreetName()),
                orEmpty(dto.getHouseNumber()),
                orEmpty(dto.getHouseNumberSuffix())
        ).trim();
        if (!orEmpty(dto.getPostalCode()).isEmpty()) {
            address = address + ", " + dto.getPostalCode();
        }

        return template
                .replace("__PAYSLIP_ID__", orEmpty(dto.getPayslipId()))
                .replace("__DATE_OF_ISSUE__", orEmpty(dto.getDateOfIssue()))
                .replace("__WEEK_NUMBER__", String.valueOf(dto.getWeekNumber()))
                .replace("__WEEK_YEAR__", String.valueOf(dto.getWeekBasedYear()))
                .replace("__NAME__", escape(dto.getName()))
                .replace("__DOB__", orEmpty(dto.getDateOfBirth()))
                .replace("__ADDRESS__", escape(address))
                .replace("__CITY__", escape(dto.getCity()))
                .replace("__COUNTRY__", escape(dto.getCountry()))
                .replace("__USER_ID__", orEmpty(dto.getUserId()))
                .replace("__START_DATE__", orEmpty(dto.getStartDate()))
                .replace("__LINES__", lines.toString())
                .replace("__GROSS__", eur.format(safe(dto.getTotalGrossAmount())))
                .replace("__TAX__", eur.format(safe(dto.getWageTaxWithheldTest())))
                .replace("__TRAVEL__", eur.format(safe(dto.getTravelExpenses())))
                .replace("__NET__", eur.format(safe(dto.getTotalNetAmount())));
    }

    public byte[] generatePayslipPdf(UUID id) {
        String html = renderPayslipHtmlForPdf(id);
        return pdfService.generatePdfFromHtml(html);
    }

    private String loadTemplate(String path) {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("could not load template " + path, e);
        }
    }

    private static BigDecimal safe(BigDecimal n) {
        return n == null ? BigDecimal.ZERO : n;
    }
    private static String orEmpty(Object v) {
        return v == null ? "" : v.toString();
    }
    private static String formatHours(BigDecimal h) {
        return String.format(Locale.US, "%.2f", h);
    }
    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&","&amp;").replace("<","&lt;")
                .replace(">","&gt;").replace("\"","&quot;");
    }
}
