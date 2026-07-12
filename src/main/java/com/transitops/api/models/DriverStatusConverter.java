package com.transitops.api.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DriverStatusConverter implements AttributeConverter<DriverStatus, String> {

    @Override
    public String convertToDatabaseColumn(DriverStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue();
    }

    @Override
    public DriverStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return DriverStatus.fromValue(dbData);
    }
}
