package com.transitops.api.tasks;

import com.transitops.api.models.Driver;
import com.transitops.api.repositories.DriverRepository;
import com.transitops.api.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class LicenseReminderTask {

    private static final Logger logger = LoggerFactory.getLogger(LicenseReminderTask.class);
    
    private final DriverRepository driverRepository;
    private final EmailService emailService;

    public LicenseReminderTask(DriverRepository driverRepository, EmailService emailService) {
        this.driverRepository = driverRepository;
        this.emailService = emailService;
    }

    // Run every day at 8:00 AM
    // For hackathon testing, we could use fixedRate = 60000 (every 1 minute)
    // @Scheduled(fixedRate = 60000)
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkExpiringLicenses() {
        logger.info("Running scheduled task: checkExpiringLicenses");
        
        LocalDate today = LocalDate.now();
        LocalDate thresholdDate = today.plusDays(30);

        List<Driver> drivers = driverRepository.findAll();
        
        for (Driver driver : drivers) {
            if (driver.getLicenseExpiryDate() != null) {
                if (driver.getLicenseExpiryDate().isBefore(today)) {
                    sendReminder(driver, "EXPIRED", "Your license expired on " + driver.getLicenseExpiryDate());
                } else if (driver.getLicenseExpiryDate().isBefore(thresholdDate) || driver.getLicenseExpiryDate().isEqual(thresholdDate)) {
                    sendReminder(driver, "EXPIRING SOON", "Your license will expire on " + driver.getLicenseExpiryDate() + ". Please renew immediately.");
                }
            }
        }
    }

    private void sendReminder(Driver driver, String status, String message) {
        String to = driver.getName().replaceAll("\\s+", ".").toLowerCase() + "@transitops.com";
        String subject = "ACTION REQUIRED: License " + status + " - " + driver.getLicenseNumber();
        String text = "Dear " + driver.getName() + ",\n\n" +
                message + "\n\n" +
                "Driver ID: " + driver.getId() + "\n" +
                "License Category: " + driver.getLicenseCategory() + "\n\n" +
                "Please contact the Fleet Manager immediately.\n\n" +
                "Regards,\nTransitOps Automated System";
                
        emailService.sendSimpleMessage(to, subject, text);
    }
}
