package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(length = 255)
    private String model;

    @Column(nullable = false)
    private String type; // 'Truck', 'Van', 'Bus', 'Car', 'Other'

    @Column(name = "max_load_capacity")
    private Integer maxLoadCapacity;

    private Integer odometer;

    @Column(name = "acquisition_cost", precision = 10, scale = 2)
    private BigDecimal acquisitionCost;

    @Column(nullable = false)
    private String status = "Available"; // 'Available', 'On Trip', 'In Shop', 'Retired'
}
