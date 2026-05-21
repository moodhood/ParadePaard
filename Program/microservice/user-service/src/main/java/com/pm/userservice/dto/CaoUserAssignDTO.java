package com.pm.userservice.dto;

import java.util.Map;

public class CaoUserAssignDTO {
    private String caoId;
    private Map<String, Double> overrides;

    public String getCaoId() { return caoId; }
    public void setCaoId(String caoId) { this.caoId = caoId; }
    public Map<String, Double> getOverrides() { return overrides; }
    public void setOverrides(Map<String, Double> overrides) { this.overrides = overrides; }
}
