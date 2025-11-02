package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentRequestDTO {
    private Long id;
    private String type;        // "FACILITY" or "EQUIPMENT"
    private String title;       // Name of the facility or equipment
    private String category;    // Human-readable category (e.g., "Facility")
    private String date;        // Date of reservation/borrowing
    private String status;      // PENDING, APPROVED, REJECTED, BORROWED, etc.
}
