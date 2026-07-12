package com.transitops.api.repositories;

import com.transitops.api.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByVehicleId(Integer vehicleId);
}
