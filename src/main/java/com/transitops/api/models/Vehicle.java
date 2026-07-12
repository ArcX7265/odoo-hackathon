package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    private String model;

    @Column(nullable = false)
    private String type; // 'Truck', 'Van', 'Bus', 'Car', 'Other'

    @Column(name = "max_load_capacity")
    private Integer maxLoadCapacity;

    private Integer odometer;

    @Column(name = "acquisition_cost")
    private BigDecimal acquisitionCost;

    private String status = "Available"; // 'Available', 'On Trip', 'In Shop', 'Retired'
}
