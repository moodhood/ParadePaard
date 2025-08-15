package com.pm.payrollservice.service.impl;

import com.pm.payrollservice.service.PayslipPdfService;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;

@Service
public class FlyingSaucerPayslipPdfService implements PayslipPdfService {
    @Override
    public byte[] generatePdfFromHtml(String html) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer r = new ITextRenderer();
            r.setDocumentFromString(html);
            r.layout();
            r.createPDF(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("pdf generation failed", e);
        }
    }
}
