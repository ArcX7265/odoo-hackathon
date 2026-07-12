package com.transitops.api.controllers;

import com.transitops.api.models.Expense;
import com.transitops.api.models.Vehicle;
import com.transitops.api.repositories.ExpenseRepository;
import com.transitops.api.repositories.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;

    public ExpenseController(ExpenseRepository expenseRepository, VehicleRepository vehicleRepository) {
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        if (expense.getVehicle() != null && expense.getVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(expense.getVehicle().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + expense.getVehicle().getId()));
            expense.setVehicle(vehicle);
        }
        return ResponseEntity.ok(expenseRepository.save(expense));
    }
}
