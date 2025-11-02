package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentBorrowingDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long equipmentId;
    private String equipmentName;
    private Integer quantity;
    private String borrowDate;
    private String expectedReturnDate;
    private String actualReturnDate;
    private String purpose;
    private String status;
    private String adminNotes;
    private String createdAt;
}
