package com.transitops.api.controllers;

import com.transitops.api.models.FuelLog;
import com.transitops.api.models.Vehicle;
import com.transitops.api.repositories.FuelLogRepository;
import com.transitops.api.repositories.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fuel-logs")
public class FuelLogController {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;

    public FuelLogController(FuelLogRepository fuelLogRepository, VehicleRepository vehicleRepository) {
        this.fuelLogRepository = fuelLogRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<FuelLog>> getAllFuelLogs() {
        return ResponseEntity.ok(fuelLogRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<FuelLog> createFuelLog(@RequestBody FuelLog log) {
        if (log.getVehicle() != null && log.getVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(log.getVehicle().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + log.getVehicle().getId()));
            log.setVehicle(vehicle);
        }
        return ResponseEntity.ok(fuelLogRepository.save(log));
    }
}
