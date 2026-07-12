package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", unique = true, nullable = false)
    private String registrationNumber;

    private String model;
    
    private String type;

    @Column(name = "max_load_capacity")
    private Integer maxLoadCapacity;

    private Integer odometer;

    @Column(name = "acquisition_cost")
    private BigDecimal acquisitionCost;

    private String status = "Available";
}
