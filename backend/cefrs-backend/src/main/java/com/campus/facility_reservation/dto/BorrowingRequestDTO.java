package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowingRequestDTO {
    private Long equipmentId;
    private Integer quantity;
    private String borrowDate;
    private String expectedReturnDate;
    private String purpose;
}