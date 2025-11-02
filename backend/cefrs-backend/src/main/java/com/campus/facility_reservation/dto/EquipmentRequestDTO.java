package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequestDTO {
    private String name;
    private String category;
    private Integer quantityTotal;
    private String description;
    private String imageUrl;
}

// For requests