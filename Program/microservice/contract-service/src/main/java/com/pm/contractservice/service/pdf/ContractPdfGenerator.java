package com.pm.contractservice.service.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.pm.contractservice.dto.UserProfileDTO;
import com.pm.contractservice.model.Contract;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Component
public class ContractPdfGenerator {

    public byte[] generate(Contract contract, UserProfileDTO userProfile) {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph("Arbeidsovereenkomst"));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Werkgever"));
            document.add(new Paragraph("Parade Paard"));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Werknemer"));
            document.add(new Paragraph("Naam: " + fullName(userProfile)));
            document.add(new Paragraph("Geboortedatum: " + nullSafe(userProfile.getDateOfBirth())));
            document.add(new Paragraph("Email: " + nullSafe(userProfile.getEmail())));
            document.add(new Paragraph("Mobiel: " + nullSafe(userProfile.getMobileNumber())));
            document.add(new Paragraph("Adres: " + formatAddress(userProfile)));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Functie: " + nullSafe(contract.getFunctionName())));
            document.add(new Paragraph("Contracttype: " + contract.getContractType()));
            document.add(new Paragraph("Contractstart: " + contract.getStartDate()));
            document.add(new Paragraph("Contracteinde: " + (contract.getEndDate() == null ? "Onbepaalde tijd" : contract.getEndDate())));
            document.add(new Paragraph("Werkplek: " + nullSafe(contract.getWorkLocation())));
            document.add(new Paragraph("Arbeidsduur: " + formatDecimal(contract.getWeeklyHours()) + " uur per week"));
            document.add(new Paragraph("Bruto uurloon: EUR " + formatDecimal(contract.getGrossHourlyWage())));
            document.add(new Paragraph("Betaalfrequentie: " + nullSafe(contract.getPaymentFrequency())));
            document.add(new Paragraph("Vakantiegeld: " + formatDecimal(contract.getHolidayAllowancePercentage()) + "%"));
            document.add(new Paragraph("Vakantiedagen: " + nullSafe(contract.getLeaveEntitlementDays()) + " dagen per jaar"));
            document.add(new Paragraph("Reiskostenvergoeding: " + (Boolean.TRUE.equals(contract.getTravelAllowance()) ? "Ja" : "Nee")));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Nederlandse arbeidsvoorwaarden"));
            document.add(new Paragraph("Proeftijd: " + nullSafe(contract.getProbationPeriod())));
            document.add(new Paragraph("Opzegtermijn: " + nullSafe(contract.getNoticePeriod())));
            document.add(new Paragraph("CAO: " + nullSafe(contract.getCollectiveAgreement())));
            document.add(new Paragraph("Pensioen: " + nullSafe(contract.getPensionScheme())));
            document.add(new Paragraph("Ziekte en verzuim: " + nullSafe(contract.getSicknessPolicy())));
            document.add(new Paragraph("Geheimhouding: " + nullSafe(contract.getConfidentialityClause())));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Dit document bevat de belangrijkste arbeidsvoorwaarden zoals functie, loon, werktijden, verlof, vakantiegeld, duur van de overeenkomst en opzegging. De toepasselijke Nederlandse wetgeving en eventuele CAO blijven gelden."));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Wij doen dit voor jou op rekeningnummer: " + nullSafe(userProfile.getIban())));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Ondertekening werkgever: __________________________ Datum: __________"));
            document.add(new Paragraph("Ondertekening werknemer: __________________________ Datum: __________"));

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("Failed to generate PDF", e);
        }
    }

    private static String fullName(UserProfileDTO profile) {
        StringBuilder sb = new StringBuilder();
        if (profile.getFirstNames() != null && !profile.getFirstNames().isBlank()) {
            sb.append(profile.getFirstNames());
        }
        if (profile.getMiddleNamePrefix() != null && !profile.getMiddleNamePrefix().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(profile.getMiddleNamePrefix());
        }
        if (profile.getLastName() != null && !profile.getLastName().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(profile.getLastName());
        }
        if (sb.length() == 0) {
            return nullSafe(profile.getPreferredName());
        }
        return sb.toString();
    }

    private static String formatAddress(UserProfileDTO profile) {
        StringBuilder sb = new StringBuilder();
        if (profile.getStreetName() != null && !profile.getStreetName().isBlank()) {
            sb.append(profile.getStreetName());
        }
        if (profile.getHouseNumber() != null && !profile.getHouseNumber().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(profile.getHouseNumber());
        }
        if (profile.getHouseNumberSuffix() != null && !profile.getHouseNumberSuffix().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(profile.getHouseNumberSuffix());
        }
        if (profile.getPostalCode() != null && !profile.getPostalCode().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(profile.getPostalCode());
        }
        if (profile.getCity() != null && !profile.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(profile.getCity());
        }
        if (profile.getCountry() != null && !profile.getCountry().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(profile.getCountry());
        }
        return sb.toString();
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private static String nullSafe(Object value) {
        return value == null ? "" : value.toString();
    }

    private static String formatDecimal(BigDecimal value) {
        return value == null ? "" : value.stripTrailingZeros().toPlainString();
    }
}
