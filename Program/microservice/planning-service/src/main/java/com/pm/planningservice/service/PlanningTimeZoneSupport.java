package com.pm.planningservice.service;

import com.pm.planningservice.model.Event;
import com.pm.planningservice.model.Shift;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class PlanningTimeZoneSupport {
    public static final String DEFAULT_EVENT_TIMEZONE = "UTC";

    private PlanningTimeZoneSupport() {
    }

    public static String normalizeEventTimezone(String rawValue) {
        String normalized = rawValue == null ? DEFAULT_EVENT_TIMEZONE : rawValue.trim();
        if (normalized.isEmpty()) {
            normalized = DEFAULT_EVENT_TIMEZONE;
        }

        try {
            return ZoneId.of(normalized).getId();
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Event time zone is invalid");
        }
    }

    public static ZoneId resolveZoneId(Event event) {
        return ZoneId.of(normalizeEventTimezone(event == null ? null : event.getEventTimezone()));
    }

    public static LocalDateTime nowInEventTimezone(Event event) {
        return LocalDateTime.now(resolveZoneId(event));
    }

    public static boolean hasShiftEnded(Shift shift, Event event) {
        return !shift.getEndTime().isAfter(nowInEventTimezone(event));
    }
}
