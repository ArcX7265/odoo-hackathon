package com.transitops.api.services;

import com.transitops.api.models.*;
import com.transitops.api.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;

    public DatabaseSeeder(UserRepository userRepository,
                          VehicleRepository vehicleRepository,
                          DriverRepository driverRepository,
                          TripRepository tripRepository,
                          MaintenanceLogRepository maintenanceLogRepository,
                          FuelLogRepository fuelLogRepository,
                          ExpenseRepository expenseRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping initialization.");
            return;
        }

        System.out.println("Seeding database with mock TransitOps data...");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // 1. Seed Users
        User manager = User.builder()
                .email("manager@transitops.com")
                .passwordHash(encoder.encode("password"))
                .role("Fleet Manager")
                .build();

        User analyst = User.builder()
                .email("analyst@transitops.com")
                .passwordHash(encoder.encode("password"))
                .role("Financial Analyst")
                .build();

        User driverUser = User.builder()
                .email("driver@transitops.com")
                .passwordHash(encoder.encode("password"))
                .role("Driver")
                .build();

        userRepository.saveAll(List.of(manager, analyst, driverUser));

        // 2. Seed Vehicles
        Vehicle v1 = Vehicle.builder()
                .registrationNumber("TX-9081")
                .model("Volvo FH16")
                .type("Truck")
                .maxLoadCapacity(25000)
                .odometer(125000)
                .acquisitionCost(new BigDecimal("120000.00"))
                .status("Available")
                .build();

        Vehicle v2 = Vehicle.builder()
                .registrationNumber("TX-4402")
                .model("Ford Transit")
                .type("Van")
                .maxLoadCapacity(3500)
                .odometer(45000)
                .acquisitionCost(new BigDecimal("45000.00"))
                .status("On Trip")
                .build();

        Vehicle v3 = Vehicle.builder()
                .registrationNumber("TX-1189")
                .model("Mercedes-Benz Sprinter")
                .type("Van")
                .maxLoadCapacity(4000)
                .odometer(80000)
                .acquisitionCost(new BigDecimal("50000.00"))
                .status("In Shop")
                .build();

        Vehicle v4 = Vehicle.builder()
                .registrationNumber("TX-5052")
                .model("Scania R500")
                .type("Truck")
                .maxLoadCapacity(26000)
                .odometer(210000)
                .acquisitionCost(new BigDecimal("135000.00"))
                .status("Available")
                .build();

        Vehicle v5 = Vehicle.builder()
                .registrationNumber("TX-8809")
                .model("Toyota Hiace")
                .type("Van")
                .maxLoadCapacity(2000)
                .odometer(15000)
                .acquisitionCost(new BigDecimal("35000.00"))
                .status("Retired")
                .build();

        vehicleRepository.saveAll(List.of(v1, v2, v3, v4, v5));

        // 3. Seed Drivers
        Driver d1 = Driver.builder()
                .name("John Doe")
                .licenseNumber("DL-908234")
                .licenseCategory("Class A")
                .licenseExpiryDate(LocalDate.of(2028, 12, 31))
                .contactNumber("555-0192")
                .safetyScore(95)
                .status("Available")
                .build();

        Driver d2 = Driver.builder()
                .name("Jane Smith")
                .licenseNumber("DL-773829")
                .licenseCategory("Class B")
                .licenseExpiryDate(LocalDate.of(2027, 6, 15))
                .contactNumber("555-0143")
                .safetyScore(88)
                .status("On Trip")
                .build();

        Driver d3 = Driver.builder()
                .name("Bob Johnson")
                .licenseNumber("DL-223409")
                .licenseCategory("Class A")
                .licenseExpiryDate(LocalDate.of(2026, 11, 20))
                .contactNumber("555-0177")
                .safetyScore(75)
                .status("Off Duty")
                .build();

        driverRepository.saveAll(List.of(d1, d2, d3));

        // 4. Seed Trips
        Trip t1 = Trip.builder()
                .source("Austin")
                .destination("Dallas")
                .vehicle(v2)
                .driver(d2)
                .cargoWeight(2500)
                .plannedDistance(200)
                .status("Dispatched")
                .build();

        Trip t2 = Trip.builder()
                .source("Houston")
                .destination("San Antonio")
                .vehicle(v1)
                .driver(d1)
                .cargoWeight(18000)
                .plannedDistance(197)
                .finalOdometer(125197)
                .fuelConsumed(new BigDecimal("65.50"))
                .status("Completed")
                .build();

        Trip t3 = Trip.builder()
                .source("El Paso")
                .destination("Austin")
                .vehicle(v4)
                .driver(d3)
                .cargoWeight(22000)
                .plannedDistance(575)
                .finalOdometer(210575)
                .fuelConsumed(new BigDecimal("190.20"))
                .status("Completed")
                .build();

        tripRepository.saveAll(List.of(t1, t2, t3));

        // 5. Seed Maintenance Logs
        MaintenanceLog mLog1 = MaintenanceLog.builder()
                .vehicle(v3)
                .description("Brake replacement and alignment")
                .logDate(LocalDate.now().minusDays(5))
                .cost(new BigDecimal("850.00"))
                .status("Open")
                .build();

        MaintenanceLog mLog2 = MaintenanceLog.builder()
                .vehicle(v1)
                .description("Engine oil filter change")
                .logDate(LocalDate.now().minusDays(20))
                .cost(new BigDecimal("150.00"))
                .status("Closed")
                .build();

        maintenanceLogRepository.saveAll(List.of(mLog1, mLog2));

        // 6. Seed Fuel Logs
        FuelLog fLog1 = FuelLog.builder()
                .vehicle(v1)
                .liters(new BigDecimal("240.0"))
                .cost(new BigDecimal("360.00"))
                .logDate(LocalDate.now().minusDays(10))
                .build();

        FuelLog fLog2 = FuelLog.builder()
                .vehicle(v2)
                .liters(new BigDecimal("80.0"))
                .cost(new BigDecimal("120.00"))
                .logDate(LocalDate.now().minusDays(7))
                .build();

        FuelLog fLog3 = FuelLog.builder()
                .vehicle(v3)
                .liters(new BigDecimal("90.0"))
                .cost(new BigDecimal("135.00"))
                .logDate(LocalDate.now().minusDays(14))
                .build();

        FuelLog fLog4 = FuelLog.builder()
                .vehicle(v4)
                .liters(new BigDecimal("320.0"))
                .cost(new BigDecimal("480.00"))
                .logDate(LocalDate.now().minusDays(3))
                .build();

        fuelLogRepository.saveAll(List.of(fLog1, fLog2, fLog3, fLog4));

        // 7. Seed Expenses
        Expense exp1 = Expense.builder()
                .vehicle(v1)
                .type("Insurance")
                .amount(new BigDecimal("1200.00"))
                .date(LocalDate.now().minusDays(11))
                .build();

        Expense exp2 = Expense.builder()
                .vehicle(v2)
                .type("Toll")
                .amount(new BigDecimal("45.50"))
                .date(LocalDate.now().minusDays(4))
                .build();

        Expense exp3 = Expense.builder()
                .vehicle(v4)
                .type("Other")
                .amount(new BigDecimal("180.00"))
                .date(LocalDate.now().minusDays(2))
                .build();

        expenseRepository.saveAll(List.of(exp1, exp2, exp3));

        System.out.println("TransitOps mock database seeded successfully.");
    }
}
