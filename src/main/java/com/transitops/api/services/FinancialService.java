package com.transitops.api.services;

import com.transitops.api.models.*;
import com.transitops.api.repositories.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;

    public FinancialService(VehicleRepository vehicleRepository,
                            MaintenanceLogRepository maintenanceLogRepository,
                            FuelLogRepository fuelLogRepository,
                            ExpenseRepository expenseRepository,
                            TripRepository tripRepository) {
        this.vehicleRepository = vehicleRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
    }

    public Map<String, Object> getKpiSummary() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        long activeVehicles = vehicles.stream().filter(v -> !"Retired".equalsIgnoreCase(v.getStatus())).count();
        long availableVehicles = vehicles.stream().filter(v -> "Available".equalsIgnoreCase(v.getStatus())).count();
        long inMaintenance = vehicles.stream().filter(v -> "In Shop".equalsIgnoreCase(v.getStatus())).count();
        long onTrip = vehicles.stream().filter(v -> "On Trip".equalsIgnoreCase(v.getStatus())).count();

        long activeTrips = tripRepository.findAll().stream()
                .filter(t -> "Dispatched".equalsIgnoreCase(t.getStatus()))
                .count();

        double fleetUtilization = activeVehicles == 0 ? 0.0 : ((double) onTrip / activeVehicles) * 100.0;
        // round to 1 decimal place
        fleetUtilization = BigDecimal.valueOf(fleetUtilization).setScale(1, RoundingMode.HALF_UP).doubleValue();

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("activeVehicles", activeVehicles);
        kpis.put("availableVehicles", availableVehicles);
        kpis.put("vehiclesInMaintenance", inMaintenance);
        kpis.put("activeTrips", activeTrips);
        kpis.put("fleetUtilization", fleetUtilization);

        return kpis;
    }

    public List<Map<String, Object>> getVehicleRoiReport() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Vehicle v : vehicles) {
            // Sum Maintenance Logs
            BigDecimal maintenanceCost = maintenanceLogRepository.findByVehicleId(v.getId()).stream()
                    .map(MaintenanceLog::getCost)
                    .filter(cost -> cost != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Sum Fuel Logs
            BigDecimal fuelCost = fuelLogRepository.findByVehicleId(v.getId()).stream()
                    .map(FuelLog::getCost)
                    .filter(cost -> cost != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Total Operational Cost (Maintenance + Fuel)
            BigDecimal totalOpCost = maintenanceCost.add(fuelCost);

            // Sum General Expenses
            BigDecimal expensesCost = expenseRepository.findByVehicleId(v.getId()).stream()
                    .map(Expense::getAmount)
                    .filter(amount -> amount != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Sum Revenue from Completed Trips: distance * 3.00
            BigDecimal revenue = tripRepository.findByVehicleIdAndStatus(v.getId(), "Completed").stream()
                    .map(t -> {
                        if (t.getPlannedDistance() != null) {
                            return BigDecimal.valueOf(t.getPlannedDistance()).multiply(new BigDecimal("3.00"));
                        }
                        return BigDecimal.ZERO;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Acquisition Cost
            BigDecimal acqCost = v.getAcquisitionCost();
            if (acqCost == null) {
                acqCost = BigDecimal.ZERO;
            }

            // Calculate ROI: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
            BigDecimal roi = BigDecimal.ZERO;
            if (acqCost.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal netEarnings = revenue.subtract(totalOpCost);
                roi = netEarnings.divide(acqCost, 4, RoundingMode.HALF_UP);
            }

            Map<String, Object> vData = new HashMap<>();
            vData.put("vehicleId", v.getId());
            vData.put("registrationNumber", v.getRegistrationNumber());
            vData.put("model", v.getModel());
            vData.put("type", v.getType());
            vData.put("acquisitionCost", acqCost);
            vData.put("totalMaintenanceCost", maintenanceCost);
            vData.put("totalFuelCost", fuelCost);
            vData.put("totalExpensesCost", expensesCost);
            vData.put("totalOperationalCost", totalOpCost);
            vData.put("revenue", revenue);
            vData.put("roi", roi.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)); // percentage (e.g. 15.5%)

            report.add(vData);
        }

        return report;
    }
}
