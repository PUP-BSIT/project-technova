package com.campus.facility_reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentSearchDTO {
    private String name;
    private String category;
    private String status;
    private Boolean availableOnly;
}