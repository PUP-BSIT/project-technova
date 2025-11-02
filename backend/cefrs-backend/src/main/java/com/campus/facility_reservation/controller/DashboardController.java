package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DashboardDTO>> getUserDashboard(@PathVariable Long userId) {
        DashboardDTO dashboard = dashboardService.getUserDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboard));
    }
    
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getUserStats(@PathVariable Long userId) {
        DashboardStatsDTO stats = dashboardService.getUserStats(userId);
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats));
    }
}
