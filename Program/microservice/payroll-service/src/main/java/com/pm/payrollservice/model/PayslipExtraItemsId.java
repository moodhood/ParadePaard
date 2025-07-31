package com.pm.payrollservice.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class PayslipExtraItemsId implements Serializable {

    private UUID payslipId;
    private String key;

    public PayslipExtraItemsId() {}

    public PayslipExtraItemsId(UUID payslipId, String key) {
        this.payslipId = payslipId;
        this.key = key;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PayslipExtraItemsId)) return false;
        PayslipExtraItemsId that = (PayslipExtraItemsId) o;
        return Objects.equals(payslipId, that.payslipId) && Objects.equals(key, that.key);
    }

    @Override
    public int hashCode() {
        return Objects.hash(payslipId, key);
    }
}
