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

    @Transactional
    public Trip createDraftTrip(Trip trip) {
        trip.setStatus(TripStatus.Draft);
        return tripRepository.save(trip);
    }

    @Transactional
    public Trip updateTripStatus(Integer id, TripStatus newStatus) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (newStatus == TripStatus.Dispatched) {
            validateDispatch(trip);
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
