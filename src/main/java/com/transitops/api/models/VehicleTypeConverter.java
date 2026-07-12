package com.transitops.api.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class VehicleTypeConverter implements AttributeConverter<VehicleType, String> {

    @Override
    public String convertToDatabaseColumn(VehicleType type) {
        if (type == null) {
            return null;
        }
        return type.getValue();
    }

    @Override
    public VehicleType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return VehicleType.fromValue(dbData);
    }
}
