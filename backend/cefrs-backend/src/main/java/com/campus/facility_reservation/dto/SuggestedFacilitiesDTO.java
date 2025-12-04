package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedFacilitiesDTO {
    private FacilityDTO unavailableFacility;
    private String requestedDate;
    private String requestedStartTime;
    private String requestedEndTime;
    private String reason;
    private List<FacilityDTO> suggestedFacilities;
}
