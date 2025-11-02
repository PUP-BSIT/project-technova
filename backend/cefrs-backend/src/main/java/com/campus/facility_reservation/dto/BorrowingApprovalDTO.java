package com.campus.facility_reservation.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class BorrowingApprovalDTO {

    @NotBlank(message = "Status is required")
    private String status; // e.g., "APPROVED", "REJECTED", "RETURNED"

    private String adminNotes;

    // Used when status is "RETURNED"
    private String actualReturnDate; // Format YYYY-MM-DD
}