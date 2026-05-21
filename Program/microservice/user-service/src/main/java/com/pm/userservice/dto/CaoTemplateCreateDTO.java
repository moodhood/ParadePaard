package com.pm.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CaoTemplateCreateDTO {
    @NotBlank
    private String name;
    private String sector;
    private String effectiveFrom;
    private String effectiveUntil;
    private List<CaoVariableDTO> variables;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(String effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public String getEffectiveUntil() { return effectiveUntil; }
    public void setEffectiveUntil(String effectiveUntil) { this.effectiveUntil = effectiveUntil; }
    public List<CaoVariableDTO> getVariables() { return variables; }
    public void setVariables(List<CaoVariableDTO> variables) { this.variables = variables; }
}
