package com.pm.payrollservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payslips")
public class Payslip {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID payslipId;

    @Column(nullable = false)
    private UUID userId;

    private String name;

    private String address;

    private Integer hoursWorked;

    private Integer hourlyWage;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalGrossAmount;

    @Column(precision = 19, scale = 4)
    private BigDecimal wageTaxWithheldTest;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalNetAmount;
}
