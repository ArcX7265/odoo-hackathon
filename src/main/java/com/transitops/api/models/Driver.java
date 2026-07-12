package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(name = "license_category")
    private String licenseCategory;

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "safety_score")
    private Integer safetyScore;

    private String status = "Available";
}
