package com.transitops.api.controllers;

import com.transitops.api.models.Driver;
import com.transitops.api.repositories.DriverRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(driverRepository.searchDrivers(search.trim()));
        }
        return ResponseEntity.ok(driverRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriverById(@PathVariable Integer id) {
        Optional<Driver> driverOpt = driverRepository.findById(id);
        if (driverOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Driver not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(driverOpt.get());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SAFETY_OFFICER')")
    public ResponseEntity<?> createDriver(@RequestBody Driver driver) {
        if (driver.getLicenseNumber() == null || driver.getLicenseNumber().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bad Request");
            error.put("message", "License number is required");
            return ResponseEntity.badRequest().body(error);
        }

        if (driverRepository.findByLicenseNumber(driver.getLicenseNumber()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Conflict");
            error.put("message", "License number " + driver.getLicenseNumber() + " is already in use");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        Driver saved = driverRepository.save(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SAFETY_OFFICER')")
    public ResponseEntity<?> updateDriver(@PathVariable Integer id, @RequestBody Driver driverData) {
        Optional<Driver> driverOpt = driverRepository.findById(id);
        if (driverOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Driver not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Driver existing = driverOpt.get();

        // Unique license number check
        if (driverData.getLicenseNumber() != null && !driverData.getLicenseNumber().equals(existing.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumber(driverData.getLicenseNumber()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Conflict");
                error.put("message", "License number " + driverData.getLicenseNumber() + " is already in use");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            existing.setLicenseNumber(driverData.getLicenseNumber());
        }

        if (driverData.getName() != null) {
            existing.setName(driverData.getName());
        }
        if (driverData.getLicenseCategory() != null) {
            existing.setLicenseCategory(driverData.getLicenseCategory());
        }
        if (driverData.getLicenseExpiryDate() != null) {
            existing.setLicenseExpiryDate(driverData.getLicenseExpiryDate());
        }
        if (driverData.getContactNumber() != null) {
            existing.setContactNumber(driverData.getContactNumber());
        }
        if (driverData.getSafetyScore() != null) {
            existing.setSafetyScore(driverData.getSafetyScore());
        }
        if (driverData.getStatus() != null) {
            existing.setStatus(driverData.getStatus());
        }

        Driver updated = driverRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SAFETY_OFFICER')")
    public ResponseEntity<?> deleteDriver(@PathVariable Integer id) {
        Optional<Driver> driverOpt = driverRepository.findById(id);
        if (driverOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Driver not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        try {
            driverRepository.deleteById(id);
            Map<String, String> message = new HashMap<>();
            message.put("message", "Driver with ID " + id + " has been deleted successfully");
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal Server Error");
            error.put("message", "Could not delete driver. They might be assigned to a trip.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
