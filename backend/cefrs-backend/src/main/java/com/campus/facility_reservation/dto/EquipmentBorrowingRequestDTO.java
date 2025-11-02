package com.campus.facility_reservation.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
public class EquipmentBorrowingRequestDTO {
    
    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotNull(message = "Borrow date is required")
    private String borrowDate; // Format YYYY-MM-DD
    
    @NotNull(message = "Expected return date is required")
    private String expectedReturnDate; // Format YYYY-MM-DD
    
    private String purpose;
}