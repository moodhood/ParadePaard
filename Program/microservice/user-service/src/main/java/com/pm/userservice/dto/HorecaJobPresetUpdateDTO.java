package com.pm.userservice.dto;

import java.util.ArrayList;
import java.util.List;

public class HorecaJobPresetUpdateDTO {
    private List<HorecaJobPresetConfigDTO> jobPresets = new ArrayList<>();

    public List<HorecaJobPresetConfigDTO> getJobPresets() {
        return jobPresets;
    }

    public void setJobPresets(List<HorecaJobPresetConfigDTO> jobPresets) {
        this.jobPresets = jobPresets;
    }
}
