package com.campus.facility_reservation.dto;

import lombok.Data;
import java.util.List;

@Data
public class SuggestedEquipmentDTO {
    private EquipmentDTO unavailableEquipment;
    private String requestedBorrowDate;
    private String requestedReturnDate;
    private String reason;
    private List<EquipmentDTO> suggestedEquipment;
}
