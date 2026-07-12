package com.transitops.api.services;

import com.transitops.api.models.*;
import com.transitops.api.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if ("Dispatched".equals(newStatus)) {
            validateDispatch(trip);
            
            // Explicitly sync vehicle status to 'On Trip'
            if (trip.getVehicle() != null) {
                Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
                vehicle.setStatus("On Trip");
                vehicleRepository.save(vehicle);
            }

            // Explicitly sync driver status to 'On Trip'
            if (trip.getDriver() != null) {
                Driver driver = driverRepository.findById(trip.getDriver().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
                driver.setStatus("On Trip");
                driverRepository.save(driver);
            }
        } else if ("Completed".equals(newStatus)) {
            if (finalOdometer == null || fuelConsumed == null) {
                throw new IllegalArgumentException("Final odometer and fuel consumed must be entered to complete a trip.");
            }

            // Set final trip details
            trip.setFinalOdometer(finalOdometer);
            trip.setFuelConsumed(fuelConsumed);

            // Revert vehicle status back to 'Available' and update odometer
            if (trip.getVehicle() != null) {
                Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
                
                if (vehicle.getOdometer() != null && finalOdometer < vehicle.getOdometer()) {
                    throw new IllegalArgumentException("Final odometer (" + finalOdometer + 
                                                       ") cannot be less than current odometer (" + vehicle.getOdometer() + ").");
                }
                
                vehicle.setStatus("Available");
                vehicle.setOdometer(finalOdometer);
                vehicleRepository.save(vehicle);
            }

            // Revert driver status back to 'Available'
            if (trip.getDriver() != null) {
                Driver driver = driverRepository.findById(trip.getDriver().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
                driver.setStatus("Available");
                driverRepository.save(driver);
            }
        } else if ("Cancelled".equals(newStatus)) {
            // Revert driver and vehicle status back to 'Available' only if cancelled from 'Dispatched' or 'In Progress'
            if ("Dispatched".equals(oldStatus) || "In Progress".equals(oldStatus)) {
                if (trip.getVehicle() != null) {
                    Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
                    vehicle.setStatus("Available");
                    vehicleRepository.save(vehicle);
                }
                if (trip.getDriver() != null) {
                    Driver driver = driverRepository.findById(trip.getDriver().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
                    driver.setStatus("Available");
                    driverRepository.save(driver);
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
        
        // Fetch fresh vehicle in case it changed or wasn't fully loaded
        Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        if (vehicle.getMaxLoadCapacity() != null && trip.getCargoWeight() != null) {
            if (trip.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
                throw new IllegalArgumentException("Dispatch blocked: Cargo weight (" + trip.getCargoWeight() + 
                                                   ") exceeds vehicle max load capacity (" + vehicle.getMaxLoadCapacity() + ").");
            }
        }
    }
}
