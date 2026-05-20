package com.pm.userservice.dto;

public class CaoVariableDTO {
    private String code;
    private String label;
    private String valueType;
    private Double value;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getValueType() { return valueType; }
    public void setValueType(String valueType) { this.valueType = valueType; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
}
