package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type; // e.g., RESERVATION, BORROWING
    private String title;
    private String message;
    private Boolean isRead;
    private Long referenceId;
    private String referenceType; // e.g., FACILITY_RESERVATION, EQUIPMENT_BORROWING
    private String createdAt;
}
