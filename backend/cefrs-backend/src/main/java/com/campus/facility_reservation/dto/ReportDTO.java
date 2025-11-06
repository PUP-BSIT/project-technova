package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

public class ReportDTO {

    // Main Dashboard Stats Response
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private FacilityUsageStats facilityUsage;
        private EquipmentUsageStats equipmentUsage;
        private UserActivityStats userActivity;
        private List<DailyReservationCount> dailyReservations;
    }

    // Facility Usage Statistics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityUsageStats {
        private Long totalReservations;
        private Double averageOccupancy; // Percentage
        private Long activeReservations;
        private Long completedReservations;
    }

    // Equipment Usage Statistics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentUsageStats {
        private Double averageDuration; // In hours
        private Long totalBorrowings;
        private Long activeBorrowings;
        private Long overdueItems;
    }

    // User Activity Statistics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivityStats {
        private String peakHours; // e.g., "9:00 AM - 12:00 PM"
        private Long totalActiveUsers;
        private Long todayReservations;
        private Long todayBorrowings;
    }

    // Daily Reservation Count (for chart)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyReservationCount {
        private LocalDate date;
        private Long facilityCount;
        private Long equipmentCount;
    }

    // Detailed Facility Report
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityReport {
        private Long facilityId;
        private String facilityName;
        private String facilityType;
        private Long totalReservations;
        private Double utilizationRate; // Percentage
        private Long approvedReservations;
        private Long pendingReservations;
        private Long rejectedReservations;
    }

    // Detailed Equipment Report
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentReport {
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private Integer quantityTotal;
        private Integer quantityAvailable;
        private Long totalBorrowings;
        private Double utilizationRate; // Percentage
        private Long overdueCount;
    }

    // User Activity Report
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivityReport {
        private Long userId;
        private String userName;
        private String email;
        private String role;
        private Long totalReservations;
        private Long totalBorrowings;
        private LocalDate lastActivity;
    }

    // Hourly Activity (for peak hours analysis)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyActivity {
        private Integer hour; // 0-23
        private Long count;
    }
}