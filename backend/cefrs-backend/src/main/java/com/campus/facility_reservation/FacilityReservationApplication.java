package com.campus.facility_reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FacilityReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacilityReservationApplication.class, args);
    }
}