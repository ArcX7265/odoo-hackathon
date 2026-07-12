package com.transitops.api.config;

import com.transitops.api.models.*;
import com.transitops.api.repositories.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DatabaseSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          VehicleRepository vehicleRepository,
                          DriverRepository driverRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seedUsers();
        seedVehicles();
        seedDrivers();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("password");

            User manager = new User();
            manager.setEmail("manager@transitops.com");
            manager.setPasswordHash(defaultPassword);
            manager.setRole(Role.FLEET_MANAGER);
            userRepository.save(manager);

            User driver = new User();
            driver.setEmail("driver@transitops.com");
            driver.setPasswordHash(defaultPassword);
            driver.setRole(Role.DRIVER);
            userRepository.save(driver);

            User safety = new User();
            safety.setEmail("safety@transitops.com");
            safety.setPasswordHash(defaultPassword);
            safety.setRole(Role.SAFETY_OFFICER);
            userRepository.save(safety);

            User finance = new User();
            finance.setEmail("finance@transitops.com");
            finance.setPasswordHash(defaultPassword);
            finance.setRole(Role.FINANCIAL_ANALYST);
            userRepository.save(finance);
        }
    }

    private void seedVehicles() {
        if (vehicleRepository.count() == 0) {
            Vehicle v1 = new Vehicle();
            v1.setRegistrationNumber("TX-9021");
            v1.setModel("Volvo FH16 Heavy Duty");
            v1.setType(VehicleType.TRUCK);
            v1.setMaxLoadCapacity(25000);
            v1.setOdometer(125000);
            v1.setAcquisitionCost(new BigDecimal("145000.00"));
            v1.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(v1);

            Vehicle v2 = new Vehicle();
            v2.setRegistrationNumber("VN-4033");
            v2.setModel("Mercedes-Benz Sprinter Cargo");
            v2.setType(VehicleType.VAN);
            v2.setMaxLoadCapacity(3500);
            v2.setOdometer(48200);
            v2.setAcquisitionCost(new BigDecimal("48000.00"));
            v2.setStatus(VehicleStatus.ON_TRIP);
            vehicleRepository.save(v2);

            Vehicle v3 = new Vehicle();
            v3.setRegistrationNumber("BS-7711");
            v3.setModel("Scania Touring Bus");
            v3.setType(VehicleType.BUS);
            v3.setMaxLoadCapacity(12000);
            v3.setOdometer(18500);
            v3.setAcquisitionCost(new BigDecimal("185000.00"));
            v3.setStatus(VehicleStatus.IN_SHOP);
            vehicleRepository.save(v3);

            Vehicle v4 = new Vehicle();
            v4.setRegistrationNumber("CR-0987");
            v4.setModel("Toyota Hilux Pickup");
            v4.setType(VehicleType.CAR);
            v4.setMaxLoadCapacity(1000);
            v4.setOdometer(98000);
            v4.setAcquisitionCost(new BigDecimal("32000.00"));
            v4.setStatus(VehicleStatus.RETIRED);
            vehicleRepository.save(v4);
        }
    }

    private void seedDrivers() {
        if (driverRepository.count() == 0) {
            Driver d1 = new Driver();
            d1.setName("Alex Johnson");
            d1.setLicenseNumber("DL-908123");
            d1.setLicenseCategory("Class A CDL");
            d1.setLicenseExpiryDate(LocalDate.now().plusMonths(6));
            d1.setContactNumber("+1-555-0199");
            d1.setSafetyScore(95);
            d1.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(d1);

            Driver d2 = new Driver();
            d2.setName("Sarah Jenkins");
            d2.setLicenseNumber("DL-443211");
            d2.setLicenseCategory("Class A CDL");
            d2.setLicenseExpiryDate(LocalDate.now().plusYears(1));
            d2.setContactNumber("+1-555-0245");
            d2.setSafetyScore(98);
            d2.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(d2);

            Driver d3 = new Driver();
            d3.setName("Michael Chang");
            d3.setLicenseNumber("DL-887110");
            d3.setLicenseCategory("Class B CDL");
            // Expired 3 months ago
            d3.setLicenseExpiryDate(LocalDate.now().minusMonths(3));
            d3.setContactNumber("+1-555-0312");
            d3.setSafetyScore(88);
            d3.setStatus(DriverStatus.OFF_DUTY);
            driverRepository.save(d3);

            Driver d4 = new Driver();
            d4.setName("David Miller");
            d4.setLicenseNumber("DL-221190");
            d4.setLicenseCategory("Class A CDL");
            d4.setLicenseExpiryDate(LocalDate.now().plusYears(2));
            d4.setContactNumber("+1-555-0455");
            d4.setSafetyScore(45);
            d4.setStatus(DriverStatus.SUSPENDED);
            driverRepository.save(d4);
        }
    }
}
