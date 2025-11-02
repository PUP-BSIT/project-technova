// Search/Filter DTOs
package com.campus.facility_reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilitySearchDTO {
    private String name;
    private String type;
    private String building;
    private Integer minCapacity;
    private String status;
}
