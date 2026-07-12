package com.transitops.api.repositories;

import com.transitops.api.models.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Integer> {
    List<MaintenanceLog> findByVehicleId(Integer vehicleId);
}
