package com.pm.contractservice.dto;

public class SignContractRequestDTO {
    private String typedSignatureName;
    private String drawnSignatureImage;
    private String agreementCheckboxText;
    private String contractVersion;
    private String documentHash;
    private String ipAddress;
    private String browserUserAgent;

    public String getTypedSignatureName() {
        return typedSignatureName;
    }

    public void setTypedSignatureName(String typedSignatureName) {
        this.typedSignatureName = typedSignatureName;
    }

    public String getDrawnSignatureImage() {
        return drawnSignatureImage;
    }

    public void setDrawnSignatureImage(String drawnSignatureImage) {
        this.drawnSignatureImage = drawnSignatureImage;
    }

    public String getAgreementCheckboxText() {
        return agreementCheckboxText;
    }

    public void setAgreementCheckboxText(String agreementCheckboxText) {
        this.agreementCheckboxText = agreementCheckboxText;
    }

    public String getContractVersion() {
        return contractVersion;
    }

    public void setContractVersion(String contractVersion) {
        this.contractVersion = contractVersion;
    }

    public String getDocumentHash() {
        return documentHash;
    }

    public void setDocumentHash(String documentHash) {
        this.documentHash = documentHash;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getBrowserUserAgent() {
        return browserUserAgent;
    }

    public void setBrowserUserAgent(String browserUserAgent) {
        this.browserUserAgent = browserUserAgent;
    }
}
