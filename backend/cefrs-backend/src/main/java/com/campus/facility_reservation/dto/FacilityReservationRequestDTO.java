package com.campus.facility_reservation.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class FacilityReservationRequestDTO {
    
    @NotNull(message = "Facility ID is required")
    private Long facilityId;
    
    @NotBlank(message = "Start time is required")
    private String startTime; // Format: YYYY-MM-DD HH:mm:ss
    
    @NotBlank(message = "End time is required")
    private String endTime; // Format: YYYY-MM-DD HH:mm:ss
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    private String additionalNotes;
}

//For creating reservations