package com.transitops.api.repositories;

import com.transitops.api.models.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, Long> {
    List<VehicleDocument> findByVehicleId(Long vehicleId);
}
