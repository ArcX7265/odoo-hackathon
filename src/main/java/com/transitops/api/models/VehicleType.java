package com.transitops.api.models;

public enum VehicleType {
    TRUCK("Truck"),
    VAN("Van"),
    BUS("Bus"),
    CAR("Car"),
    OTHER("Other");

    private final String value;

    VehicleType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static VehicleType fromValue(String value) {
        for (VehicleType t : VehicleType.values()) {
            if (t.getValue().equalsIgnoreCase(value)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown VehicleType value: " + value);
    }
}
