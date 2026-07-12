package com.transitops.api.services;

import com.transitops.api.models.*;
import com.transitops.api.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    public Map<String, Object> getAvailableAssets() {
        List<Vehicle> availableVehicles = vehicleRepository.findByStatus("Available");
        List<Driver> availableDrivers = driverRepository.findByStatus("Available");

        Map<String, Object> response = new HashMap<>();
        response.put("vehicles", availableVehicles);
        response.put("drivers", availableDrivers);
        return response;
    }

    public List<Trip> getActiveDispatches() {
        return tripRepository.findByStatusIn(List.of("Dispatched", "In Progress"));
    }

    @Transactional
    public Trip createDraftTrip(Trip trip) {
        trip.setStatus("Draft");
        return tripRepository.save(trip);
    }

    @Transactional
    public Trip updateTripStatus(Integer id, String newStatus, Integer finalOdometer, java.math.BigDecimal fuelConsumed) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        String oldStatus = trip.getStatus();

        // Dispatch handling – set vehicle and driver to On Trip
        if ("Dispatched".equals(newStatus) && !"Dispatched".equals(oldStatus)) {
            validateDispatch(trip);
            if (trip.getVehicle() != null) {
                Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId()).orElseThrow();
                vehicle.setStatus("On Trip");
                vehicleRepository.save(vehicle);
            }
            if (trip.getDriver() != null) {
                Driver driver = driverRepository.findById(trip.getDriver().getId()).orElseThrow();
                driver.setStatus("On Trip");
                driverRepository.save(driver);
            }
        }

        // Completion or cancellation handling – revert statuses to Available where appropriate
        if (("Completed".equals(newStatus) || "Cancelled".equals(newStatus))
                && ("Dispatched".equals(oldStatus) || "In Progress".equals(oldStatus))) {
            if ("Completed".equals(newStatus)) {
                if (finalOdometer == null || fuelConsumed == null) {
                    throw new IllegalArgumentException("Final odometer and fuel consumed must be entered to complete a trip.");
                }
                trip.setFinalOdometer(finalOdometer);
                trip.setFuelConsumed(fuelConsumed);

                if (trip.getVehicle() != null) {
                    Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId()).orElseThrow();
                    if (vehicle.getOdometer() != null && finalOdometer < vehicle.getOdometer()) {
                        throw new IllegalArgumentException("Final odometer (" + finalOdometer + ") cannot be less than current odometer (" + vehicle.getOdometer() + ").");
                    }
                    vehicle.setStatus("Available");
                    vehicle.setOdometer(finalOdometer);
                    vehicleRepository.save(vehicle);
                }
                if (trip.getDriver() != null) {
                    Driver driver = driverRepository.findById(trip.getDriver().getId()).orElseThrow();
                    driver.setStatus("Available");
                    driverRepository.save(driver);
                }
            } else { // Cancelled
                if (trip.getVehicle() != null) {
                    Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId()).orElseThrow();
                    if (!"Retired".equals(vehicle.getStatus())) {
                        vehicle.setStatus("Available");
                        vehicleRepository.save(vehicle);
                    }
                }
                if (trip.getDriver() != null) {
                    Driver driver = driverRepository.findById(trip.getDriver().getId()).orElseThrow();
                    if (!"Suspended".equals(driver.getStatus())) {
                        driver.setStatus("Available");
                        driverRepository.save(driver);
                    }
                }
            }
        }

        trip.setStatus(newStatus);
        return tripRepository.save(trip);
    }

    private void validateDispatch(Trip trip) {
        if (trip.getVehicle() == null) {
            throw new IllegalArgumentException("A vehicle must be assigned before dispatching.");
        }
        
        if (trip.getDriver() == null) {
            throw new IllegalArgumentException("A driver must be assigned before dispatching.");
        }
        
        // Fetch fresh driver
        Driver driver = driverRepository.findById(trip.getDriver().getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
                
        if ("Suspended".equalsIgnoreCase(driver.getStatus())) {
            throw new IllegalArgumentException("Dispatch blocked: Driver is Suspended.");
        }
        if ("On Trip".equalsIgnoreCase(driver.getStatus())) {
            throw new IllegalArgumentException("Dispatch blocked: Driver is already On Trip.");
        }
        if (driver.getLicenseExpiryDate() != null && driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Dispatch blocked: Driver's license has expired.");
        }
        
        // Fetch fresh vehicle in case it changed or wasn't fully loaded
        Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        if ("Retired".equalsIgnoreCase(vehicle.getStatus()) || "In Shop".equalsIgnoreCase(vehicle.getStatus())) {
            throw new IllegalArgumentException("Dispatch blocked: Vehicle is " + vehicle.getStatus() + " and cannot be dispatched.");
        }
        if ("On Trip".equalsIgnoreCase(vehicle.getStatus())) {
            throw new IllegalArgumentException("Dispatch blocked: Vehicle is already On Trip.");
        }

        if (vehicle.getMaxLoadCapacity() != null && trip.getCargoWeight() != null) {
            if (trip.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
                throw new IllegalArgumentException("Dispatch blocked: Cargo weight (" + trip.getCargoWeight() + 
                                                   ") exceeds vehicle max load capacity (" + vehicle.getMaxLoadCapacity() + ").");
            }
        }
    }
}
