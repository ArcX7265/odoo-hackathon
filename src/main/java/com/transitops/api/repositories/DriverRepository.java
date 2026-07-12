package com.transitops.api.repositories;

import com.transitops.api.models.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Integer> {
    List<Driver> findByStatus(String status);
}
}
