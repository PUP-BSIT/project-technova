package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.ReportDTO;
import com.campus.facility_reservation.repository.EquipmentBorrowingRepository;
import com.campus.facility_reservation.repository.FacilityReservationRepository;
import com.campus.facility_reservation.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private FacilityReservationRepository facilityReservationRepository;

    @Autowired
    private EquipmentBorrowingRepository equipmentBorrowingRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    // Get complete dashboard statistics
    public ReportDTO.DashboardStats getDashboardStats() {
        ReportDTO.FacilityUsageStats facilityStats = getFacilityUsageStats();
        ReportDTO.EquipmentUsageStats equipmentStats = getEquipmentUsageStats();
        ReportDTO.UserActivityStats userActivityStats = getUserActivityStats();
        List<ReportDTO.DailyReservationCount> dailyReservations = getDailyReservations(30);

        return new ReportDTO.DashboardStats(
            facilityStats,
            equipmentStats,
            userActivityStats,
            dailyReservations
        );
    }

    // Facility Usage Statistics
    public ReportDTO.FacilityUsageStats getFacilityUsageStats() {
        Long totalReservations = facilityReservationRepository.countTotalReservations();
        Long activeReservations = facilityReservationRepository.countActiveReservations();
        Long completedReservations = facilityReservationRepository.countCompletedReservations();
        
        // Calculate average occupancy (percentage of time facilities are reserved)
        Long totalFacilities = facilityRepository.count();
        Double averageOccupancy = totalFacilities > 0 
            ? (activeReservations.doubleValue() / totalFacilities.doubleValue()) * 100 
            : 0.0;

        return new ReportDTO.FacilityUsageStats(
            totalReservations,
            Math.round(averageOccupancy * 100.0) / 100.0, // Round to 2 decimals
            activeReservations,
            completedReservations
        );
    }

    // Equipment Usage Statistics
    public ReportDTO.EquipmentUsageStats getEquipmentUsageStats() {
        Long totalBorrowings = equipmentBorrowingRepository.countTotalBorrowings();
        Long activeBorrowings = equipmentBorrowingRepository.countActiveBorrowings();
        Long overdueItems = equipmentBorrowingRepository.countOverdueItems(LocalDate.now());
        
        // Get average duration in days and convert to hours
        Double avgDurationDays = equipmentBorrowingRepository.getAverageDurationInDays();
        Double avgDurationHours = avgDurationDays != null ? avgDurationDays * 24 : 0.0;

        return new ReportDTO.EquipmentUsageStats(
            Math.round(avgDurationHours * 100.0) / 100.0, // Round to 2 decimals
            totalBorrowings,
            activeBorrowings,
            overdueItems
        );
    }

    // User Activity Statistics
    public ReportDTO.UserActivityStats getUserActivityStats() {
        String peakHours = getPeakHours();
        Long totalActiveUsers = facilityReservationRepository.countUniqueUsers();
        Long todayReservations = facilityReservationRepository.countTodayReservations(LocalDate.now());
        Long todayBorrowings = equipmentBorrowingRepository.countTodayBorrowings(LocalDate.now());

        return new ReportDTO.UserActivityStats(
            peakHours,
            totalActiveUsers,
            todayReservations,
            todayBorrowings
        );
    }

    // Get peak hours
    private String getPeakHours() {
        List<Object[]> hourlyActivity = facilityReservationRepository.getHourlyActivity();
        
        if (hourlyActivity.isEmpty()) {
            return "N/A";
        }

        // Get top 3 peak hours
        List<Integer> topHours = hourlyActivity.stream()
            .limit(3)
            .map(row -> ((Number) row[0]).intValue())
            .collect(Collectors.toList());

        if (topHours.isEmpty()) {
            return "N/A";
        }

        // Format as time range
        Integer firstHour = topHours.get(0);
        Integer lastHour = topHours.get(topHours.size() - 1);
        
        return formatHour(firstHour) + " - " + formatHour(lastHour + 1);
    }

    private String formatHour(int hour) {
        if (hour == 0) return "12:00 AM";
        if (hour < 12) return hour + ":00 AM";
        if (hour == 12) return "12:00 PM";
        return (hour - 12) + ":00 PM";
    }

    // Get daily reservations for chart (last N days)
    public List<ReportDTO.DailyReservationCount> getDailyReservations(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        List<Object[]> facilityData = facilityReservationRepository.getDailyReservationCounts(startDate);
        List<Object[]> equipmentData = equipmentBorrowingRepository.getDailyBorrowingCounts(startDate);
        
        // Combine data by date
        List<ReportDTO.DailyReservationCount> result = new ArrayList<>();
        
        for (int i = 0; i <= days; i++) {
            LocalDate date = startDate.plusDays(i);
            Long facilityCount = getCountForDate(facilityData, date);
            Long equipmentCount = getCountForDate(equipmentData, date);
            result.add(new ReportDTO.DailyReservationCount(date, facilityCount, equipmentCount));
        }
        
        return result;
    }

    private Long getCountForDate(List<Object[]> data, LocalDate date) {
        return data.stream()
            .filter(row -> row[0].equals(date))
            .findFirst()
            .map(row -> ((Number) row[1]).longValue())
            .orElse(0L);
    }

   // Detailed Facility Report
    public List<ReportDTO.FacilityReport> getFacilityReport() {
        List<Object[]> data = facilityReservationRepository.getFacilityUsageReport();
        
        return data.stream()
            .map(row -> {
                Long facilityId = ((Number) row[0]).longValue();
                String name = (String) row[1];
                String type = row[2].toString();
                Long total = ((Number) row[3]).longValue();
                Long approved = ((Number) row[4]).longValue();
                Long pending = ((Number) row[5]).longValue();
                Long rejected = ((Number) row[6]).longValue();
                
                Double utilizationRate = total > 0 ? (approved.doubleValue() / total.doubleValue()) * 100 : 0.0;
                
                return new ReportDTO.FacilityReport(
                    facilityId, name, type, total,
                    Math.round(utilizationRate * 100.0) / 100.0,
                    approved, pending, rejected
                );
            })
            .collect(Collectors.toList());
    }

    // Detailed Equipment Report
    public List<ReportDTO.EquipmentReport> getEquipmentReport() {
        List<Object[]> data = equipmentBorrowingRepository.getEquipmentUsageReport();
        List<ReportDTO.EquipmentReport> result = new ArrayList<>();
        
        for (Object[] row : data) {
            Long equipmentId = ((Number) row[0]).longValue();
            String name = (String) row[1];
            String category = row[2].toString();

            Integer quantityTotal = (Integer) row[3];
            Integer quantityAvailable = (Integer) row[4];
            Long totalBorrowings = ((Number) row[5]).longValue();
            Long overdueCount = ((Number) row[6]).longValue();

            if (quantityTotal == null) quantityTotal = 0;
            if (quantityAvailable == null) quantityAvailable = 0;

            Double utilizationRate = quantityTotal > 0
                ? (((double)(quantityTotal - quantityAvailable)) / quantityTotal) * 100
                : 0.0;

            result.add(new ReportDTO.EquipmentReport(
                equipmentId, name, category, quantityTotal, quantityAvailable,
                totalBorrowings,
                Math.round(utilizationRate * 100.0) / 100.0,
                overdueCount
            ));
        }

        return result;
    }

    // User Activity Report (combined facility and equipment)
    public List<ReportDTO.UserActivityReport> getUserActivityReport() {
        List<Object[]> facilityData = facilityReservationRepository.getUserActivityReport();
        List<Object[]> equipmentData = equipmentBorrowingRepository.getUserBorrowingReport();
        
        List<ReportDTO.UserActivityReport> result = new ArrayList<>();
        
        // Add facility reservation data
        for (Object[] row : facilityData) {
            Long userId = ((Number) row[0]).longValue();
            String userName = row[1] + " " + row[2];
            String email = (String) row[3];
            String role = row[4].toString();
            Long reservations = ((Number) row[5]).longValue();
            LocalDate lastActivity = ((java.sql.Timestamp) row[6]).toLocalDateTime().toLocalDate();
            
            result.add(new ReportDTO.UserActivityReport(
                userId, userName, email, role, reservations, 0L, lastActivity
            ));
        }
        
        // Merge equipment borrowing data
        for (Object[] row : equipmentData) {
            Long userId = ((Number) row[0]).longValue();
            Long borrowings = ((Number) row[5]).longValue();
            
            ReportDTO.UserActivityReport existing = result.stream()
                .filter(r -> r.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
            
            if (existing != null) {
                existing.setTotalBorrowings(borrowings);
            } else {
                String userName = row[1] + " " + row[2];
                String email = (String) row[3];
                String role = row[4].toString();
                LocalDate lastActivity = ((java.sql.Timestamp) row[6]).toLocalDateTime().toLocalDate();
                
                result.add(new ReportDTO.UserActivityReport(
                    userId, userName, email, role, 0L, borrowings, lastActivity
                ));
            }
        }
        
        return result;
    }
}