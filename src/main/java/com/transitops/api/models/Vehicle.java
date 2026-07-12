package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(length = 255)
    private String model;

    @Column(nullable = false)
    @Convert(converter = VehicleTypeConverter.class)
    private VehicleType type;

    @Column(name = "max_load_capacity")
    private Integer maxLoadCapacity;

    private Integer odometer;

    @Column(name = "acquisition_cost", precision = 10, scale = 2)
    private BigDecimal acquisitionCost;

    @Column(nullable = false)
    @Convert(converter = VehicleStatusConverter.class)
    private VehicleStatus status = VehicleStatus.AVAILABLE;
}
