package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.ReportDTO;
import com.campus.facility_reservation.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Get complete dashboard statistics
     * GET /api/reports/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ReportDTO.DashboardStats> getDashboardStats() {
        try {
            ReportDTO.DashboardStats stats = reportService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get facility usage statistics only
     * GET /api/reports/facility-usage
     */
    @GetMapping("/facility-usage")
    public ResponseEntity<ReportDTO.FacilityUsageStats> getFacilityUsageStats() {
        try {
            ReportDTO.FacilityUsageStats stats = reportService.getFacilityUsageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get equipment usage statistics only
     * GET /api/reports/equipment-usage
     */
    @GetMapping("/equipment-usage")
    public ResponseEntity<ReportDTO.EquipmentUsageStats> getEquipmentUsageStats() {
        try {
            ReportDTO.EquipmentUsageStats stats = reportService.getEquipmentUsageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user activity statistics only
     * GET /api/reports/user-activity
     */
    @GetMapping("/user-activity")
    public ResponseEntity<ReportDTO.UserActivityStats> getUserActivityStats() {
        try {
            ReportDTO.UserActivityStats stats = reportService.getUserActivityStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get daily reservations for chart
     * GET /api/reports/daily-reservations?days=30
     */
    @GetMapping("/daily-reservations")
    public ResponseEntity<List<ReportDTO.DailyReservationCount>> getDailyReservations(
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<ReportDTO.DailyReservationCount> data = reportService.getDailyReservations(days);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed facility usage report
     * GET /api/reports/facilities
     */
    @GetMapping("/facilities")
    public ResponseEntity<List<ReportDTO.FacilityReport>> getFacilityReport() {
        try {
            List<ReportDTO.FacilityReport> report = reportService.getFacilityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed equipment usage report
     * GET /api/reports/equipment
     */
    @GetMapping("/equipment")
    public ResponseEntity<List<ReportDTO.EquipmentReport>> getEquipmentReport() {
        try {
            List<ReportDTO.EquipmentReport> report = reportService.getEquipmentReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user activity report
     * GET /api/reports/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<ReportDTO.UserActivityReport>> getUserActivityReport() {
        try {
            List<ReportDTO.UserActivityReport> report = reportService.getUserActivityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}