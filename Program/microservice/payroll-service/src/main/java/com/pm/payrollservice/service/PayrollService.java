package com.pm.payrollservice.service;

import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.dto.PayslipResponseDTO;
import com.pm.payrollservice.mapper.PayslipMapper;
import com.pm.payrollservice.model.Payslip;
import org.springframework.stereotype.Service;
import com.pm.payrollservice.repository.PayslipRepository;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.UUID;

@Service
public class PayrollService {
    private final PayslipRepository payslipRepository;

    public PayrollService(PayslipRepository payslipRepository){
        this.payslipRepository = payslipRepository;
    }

    public List<PayslipResponseDTO> getPayslips(){
        List<Payslip> payslips = payslipRepository.findAll();
        return payslips.stream().map(PayslipMapper::toDTO).toList();
    }

    public PayslipResponseDTO createPayslip(PayslipRequestDTO payslipRequestDTO){
        LocalDate date = LocalDate.parse(payslipRequestDTO.getDateOfIssue());
        int weekNumber = date.get(WeekFields.ISO.weekOfWeekBasedYear());
        UUID userId = UUID.fromString(payslipRequestDTO.getUserId());

        if (payslipRepository.existsByWeekNumberAndUserId(weekNumber, userId)) {
            throw new IllegalArgumentException("Payslip for that ISO week already exists for user");
        }

        Payslip payslip = payslipRepository.save(PayslipMapper.toModel(payslipRequestDTO));

        // calculation

        return PayslipMapper.toDTO(payslip);
    }

    public PayslipResponseDTO updatePayslip(UUID id, PayslipRequestDTO payslipRequestDTO){
        Payslip payslip = payslipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payslip with id: " + id + " not found"));

        payslip.setUserId(UUID.fromString(payslipRequestDTO.getUserId()));
        payslip.setDateOfIssue(LocalDate.parse(payslipRequestDTO.getDateOfIssue()));
        payslip.setHoursWorked(payslipRequestDTO.getHoursWorked());
        payslip.setHourlyWage(payslipRequestDTO.getHourlyWage());

        // any additional calculation logic would go here

        payslip = payslipRepository.save(payslip);
        return PayslipMapper.toDTO(payslip);
    }

    public void deletePayslip(UUID id){
        payslipRepository.deleteById(id);
    }

}
