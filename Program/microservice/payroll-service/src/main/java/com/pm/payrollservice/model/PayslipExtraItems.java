package com.pm.payrollservice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payslip_extra_items")
public class PayslipExtraItems {

    @Id
    @Column(name = "payslip_id", nullable = false)
    private UUID payslipId;

    @Column(name = "item_key", nullable = false)
    private String key;

    @Column(name = "item_value", precision = 19, scale = 4)
    private BigDecimal value;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
