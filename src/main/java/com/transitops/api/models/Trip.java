package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
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

    private String status; // 'Draft', 'Dispatched', 'Completed', 'Cancelled'
}
