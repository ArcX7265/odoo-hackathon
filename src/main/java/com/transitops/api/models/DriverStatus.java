package com.transitops.api.models;

public enum DriverStatus {
    AVAILABLE("Available"),
    ON_TRIP("On Trip"),
    OFF_DUTY("Off Duty"),
    SUSPENDED("Suspended");

    private final String value;

    DriverStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static DriverStatus fromValue(String value) {
        for (DriverStatus s : DriverStatus.values()) {
            if (s.getValue().equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown DriverStatus value: " + value);
    }
}
