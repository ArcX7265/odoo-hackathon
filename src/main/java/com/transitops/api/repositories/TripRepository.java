package com.transitops.api.repositories;

import com.transitops.api.models.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByVehicleId(Integer vehicleId);
    List<Trip> findByVehicleIdAndStatus(Integer vehicleId, String status);
    List<Trip> findByStatusIn(List<String> statuses);
}
