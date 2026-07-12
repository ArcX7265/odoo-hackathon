package com.transitops.api.services;

import com.transitops.api.models.MaintenanceLog;
import com.transitops.api.models.Vehicle;
import com.transitops.api.repositories.MaintenanceLogRepository;
import com.transitops.api.repositories.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository,
                              VehicleRepository vehicleRepository) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public MaintenanceLog logMaintenance(MaintenanceLog log) {
        if (log.getStatus() == null || log.getStatus().isEmpty()) {
            log.setStatus("Open");
        }

        // Fetch complete vehicle to ensure relationship fields are populated
        if (log.getVehicle() != null && log.getVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(log.getVehicle().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + log.getVehicle().getId()));
            log.setVehicle(vehicle);
        }

        MaintenanceLog savedLog = maintenanceLogRepository.save(log);

        // Automation: Update vehicle status to 'In Shop' automatically when a new 'Open' MaintenanceLog is created.
        if ("Open".equalsIgnoreCase(savedLog.getStatus()) && savedLog.getVehicle() != null) {
            Vehicle vehicle = savedLog.getVehicle();
            vehicle.setStatus("In Shop");
            vehicleRepository.save(vehicle);
        }

        return savedLog;
    }

    @Transactional
    public MaintenanceLog resolveMaintenance(Integer id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance log not found with ID: " + id));

        log.setStatus("Closed");
        MaintenanceLog savedLog = maintenanceLogRepository.save(log);

        // Automation: Transition vehicle status back to 'Available' upon resolution of maintenance, unless retired.
        if (savedLog.getVehicle() != null) {
            Vehicle vehicle = savedLog.getVehicle();
            if (!"Retired".equalsIgnoreCase(vehicle.getStatus())) {
                vehicle.setStatus("Available");
                vehicleRepository.save(vehicle);
            }
        }

        return savedLog;
    }
}
