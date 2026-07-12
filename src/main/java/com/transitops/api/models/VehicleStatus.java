package com.transitops.api.models;

public enum VehicleStatus {
    AVAILABLE("Available"),
    ON_TRIP("On Trip"),
    IN_SHOP("In Shop"),
    RETIRED("Retired");

    private final String value;

    VehicleStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static VehicleStatus fromValue(String value) {
        for (VehicleStatus s : VehicleStatus.values()) {
            if (s.getValue().equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown VehicleStatus value: " + value);
    }
}
