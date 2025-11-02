package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long activeReservations;
    private Long borrowedEquipment;
    private Long pendingRequests;
    private Long totalRequests;
}