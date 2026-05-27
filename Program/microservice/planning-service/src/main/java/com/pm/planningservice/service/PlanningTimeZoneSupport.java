package com.pm.planningservice.service;

import com.pm.planningservice.model.Project;
import com.pm.planningservice.model.Shift;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class PlanningTimeZoneSupport {
    public static final String DEFAULT_PROJECT_TIMEZONE = "UTC";

    private PlanningTimeZoneSupport() {
    }

    public static String normalizeProjectTimezone(String rawValue) {
        String normalized = rawValue == null ? DEFAULT_PROJECT_TIMEZONE : rawValue.trim();
        if (normalized.isEmpty()) {
            normalized = DEFAULT_PROJECT_TIMEZONE;
        }

        try {
            return ZoneId.of(normalized).getId();
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Project time zone is invalid");
        }
    }

    public static ZoneId resolveZoneId(Project project) {
        return ZoneId.of(normalizeProjectTimezone(project == null ? null : project.getProjectTimezone()));
    }

    public static LocalDateTime nowInProjectTimezone(Project project) {
        return LocalDateTime.now(resolveZoneId(project));
    }

    public static boolean hasShiftEnded(Shift shift, Project project) {
        return !shift.getEndTime().isAfter(nowInProjectTimezone(project));
    }
}
