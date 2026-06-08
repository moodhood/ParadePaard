package com.pm.userservice.dto;

import java.util.ArrayList;
import java.util.List;

public class HorecaRuleSectionUpdateDTO {
    private List<HorecaRuleItemDTO> items = new ArrayList<>();

    public List<HorecaRuleItemDTO> getItems() {
        return items;
    }

    public void setItems(List<HorecaRuleItemDTO> items) {
        this.items = items;
    }
}
