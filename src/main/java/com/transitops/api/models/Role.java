package com.transitops.api.models;

public enum Role {
    FLEET_MANAGER("Fleet Manager"),
    DRIVER("Driver"),
    SAFETY_OFFICER("Safety Officer"),
    FINANCIAL_ANALYST("Financial Analyst");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromValue(String value) {
        for (Role r : Role.values()) {
            if (r.getValue().equalsIgnoreCase(value)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown Role value: " + value);
    }
}
