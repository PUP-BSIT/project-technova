package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO {
    private Long id;
    private String name;
    private String type;
    private String building;
    private String floor;
    private Integer capacity;
    private String description;
    private String imageUrl;
    private String status;
}