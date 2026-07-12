package com.transitops.api.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "license_number", nullable = false, unique = true, length = 100)
    private String licenseNumber;

    @Column(name = "license_category", length = 50)
    private String licenseCategory;

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "safety_score")
    private Integer safetyScore;

    @Column(nullable = false)
    private String status = "Available"; // 'Available', 'On Trip', 'Off Duty', 'Suspended'
}
