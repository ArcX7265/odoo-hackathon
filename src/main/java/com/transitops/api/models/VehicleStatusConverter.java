package com.transitops.api.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class VehicleStatusConverter implements AttributeConverter<VehicleStatus, String> {

    @Override
    public String convertToDatabaseColumn(VehicleStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue();
    }

    @Override
    public VehicleStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return VehicleStatus.fromValue(dbData);
    }
}
