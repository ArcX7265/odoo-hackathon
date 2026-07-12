package com.transitops.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TransitopsApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(TransitopsApiApplication.class, args);
    }
}
