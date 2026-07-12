package com.transitops.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender emailSender;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            // Uncomment the next line if you configure a real SMTP server like Mailtrap
            // SimpleMailMessage message = new SimpleMailMessage();
            // message.setFrom("noreply@transitops.com");
            // message.setTo(to);
            // message.setSubject(subject);
            // message.setText(text);
            // emailSender.send(message);

            logger.info("========================================");
            logger.info("Mock Email Sent!");
            logger.info("To: {}", to);
            logger.info("Subject: {}", subject);
            logger.info("Body:\n{}", text);
            logger.info("========================================");
        } catch (Exception e) {
            logger.error("Failed to send mock email to {}: {}", to, e.getMessage());
        }
    }
}
