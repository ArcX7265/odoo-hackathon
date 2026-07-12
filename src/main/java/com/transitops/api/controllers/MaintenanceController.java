package com.transitops.api.controllers;

import com.transitops.api.models.MaintenanceLog;
import com.transitops.api.services.MaintenanceService;
import com.transitops.api.repositories.MaintenanceLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public MaintenanceController(MaintenanceService maintenanceService,
                                 MaintenanceLogRepository maintenanceLogRepository) {
        this.maintenanceService = maintenanceService;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceLog>> getAllMaintenanceLogs() {
        return ResponseEntity.ok(maintenanceLogRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<MaintenanceLog> logMaintenance(@RequestBody MaintenanceLog log) {
        return ResponseEntity.ok(maintenanceService.logMaintenance(log));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<MaintenanceLog> resolveMaintenance(@PathVariable Integer id) {
        return ResponseEntity.ok(maintenanceService.resolveMaintenance(id));
    }
}
