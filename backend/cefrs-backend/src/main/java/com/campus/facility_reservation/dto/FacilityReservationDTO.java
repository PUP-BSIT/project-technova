package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityReservationDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long facilityId;
    private String facilityName;
    private String reservationDate;
    private String startTime;
    private String endTime;
    private String purpose;
    private String status;
    private String adminNotes;
    private String createdAt;
}

//For responses