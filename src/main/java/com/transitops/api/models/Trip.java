package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(name = "cargo_weight")
    private Integer cargoWeight;

    @Column(name = "planned_distance")
    private Integer plannedDistance;

    @Column(name = "final_odometer")
    private Integer finalOdometer;

    @Column(name = "fuel_consumed")
    private BigDecimal fuelConsumed;

    @Enumerated(EnumType.STRING)
    private TripStatus status = TripStatus.Draft;
}
