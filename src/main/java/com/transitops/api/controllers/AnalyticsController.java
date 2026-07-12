package com.transitops.api.controllers;

import com.transitops.api.services.FinancialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final FinancialService financialService;

    public AnalyticsController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping("/kpi-summary")
    public ResponseEntity<Map<String, Object>> getKpiSummary() {
        return ResponseEntity.ok(financialService.getKpiSummary());
    }

    @GetMapping("/vehicle-roi")
    public ResponseEntity<List<Map<String, Object>>> getVehicleRoiReport() {
        return ResponseEntity.ok(financialService.getVehicleRoiReport());
    }
}
