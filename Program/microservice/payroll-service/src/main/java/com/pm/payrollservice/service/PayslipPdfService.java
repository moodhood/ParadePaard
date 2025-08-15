package com.pm.payrollservice.service;

public interface PayslipPdfService {
    byte[] generatePdfFromHtml(String html);
}