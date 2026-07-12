package com.transitops.api.controllers;

import com.transitops.api.models.Vehicle;
import com.transitops.api.repositories.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(vehicleRepository.searchVehicles(search.trim()));
        }
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Vehicle not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(vehicleOpt.get());
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<?> createVehicle(@RequestBody Vehicle vehicle) {
        if (vehicle.getRegistrationNumber() == null || vehicle.getRegistrationNumber().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bad Request");
            error.put("message", "Registration number is required");
            return ResponseEntity.badRequest().body(error);
        }

        if (vehicleRepository.findByRegistrationNumber(vehicle.getRegistrationNumber()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Conflict");
            error.put("message", "Registration number " + vehicle.getRegistrationNumber() + " is already registered");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicleData) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Vehicle not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Vehicle existing = vehicleOpt.get();

        // Unique registration number check
        if (vehicleData.getRegistrationNumber() != null && !vehicleData.getRegistrationNumber().equals(existing.getRegistrationNumber())) {
            if (vehicleRepository.findByRegistrationNumber(vehicleData.getRegistrationNumber()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Conflict");
                error.put("message", "Registration number " + vehicleData.getRegistrationNumber() + " is already in use");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            existing.setRegistrationNumber(vehicleData.getRegistrationNumber());
        }

        if (vehicleData.getModel() != null) {
            existing.setModel(vehicleData.getModel());
        }
        if (vehicleData.getType() != null) {
            existing.setType(vehicleData.getType());
        }
        if (vehicleData.getMaxLoadCapacity() != null) {
            existing.setMaxLoadCapacity(vehicleData.getMaxLoadCapacity());
        }
        if (vehicleData.getOdometer() != null) {
            existing.setOdometer(vehicleData.getOdometer());
        }
        if (vehicleData.getAcquisitionCost() != null) {
            existing.setAcquisitionCost(vehicleData.getAcquisitionCost());
        }
        if (vehicleData.getStatus() != null) {
            existing.setStatus(vehicleData.getStatus());
        }

        Vehicle updated = vehicleRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not Found");
            error.put("message", "Vehicle not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        try {
            vehicleRepository.deleteById(id);
            Map<String, String> message = new HashMap<>();
            message.put("message", "Vehicle with ID " + id + " has been deleted successfully");
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal Server Error");
            error.put("message", "Could not delete vehicle. It might be referenced by a trip or log.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
