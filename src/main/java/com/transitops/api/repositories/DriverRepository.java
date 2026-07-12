package com.transitops.api.repositories;

import com.transitops.api.models.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);

    @Query("SELECT d FROM Driver d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.licenseNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Driver> searchDrivers(@Param("query") String query);
}
