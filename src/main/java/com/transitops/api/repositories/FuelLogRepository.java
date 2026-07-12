package com.transitops.api.repositories;

import com.transitops.api.models.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FuelLogRepository extends JpaRepository<FuelLog, Integer> {
    List<FuelLog> findByVehicleId(Integer vehicleId);
}
