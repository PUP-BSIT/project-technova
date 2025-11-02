package com.campus.facility_reservation.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ReservationApprovalDTO {

    @NotBlank(message = "Status is required")
    private String status; // e.g., "APPROVED", "REJECTED"

    private String adminNotes;
}