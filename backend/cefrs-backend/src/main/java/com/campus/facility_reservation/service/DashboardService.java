package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.entity.*;
import com.campus.facility_reservation.entity.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.entity.EquipmentBorrowing.BorrowingStatus;
import com.campus.facility_reservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final FacilityReservationRepository reservationRepository;
    private final EquipmentBorrowingRepository borrowingRepository;
    private final UserRepository userRepository;
    
    public DashboardDTO getUserDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DashboardStatsDTO stats = getUserStats(userId);
        List<RecentRequestDTO> recentRequests = getRecentRequests(user);
        
        return new DashboardDTO(stats, recentRequests);
    }
    
    public DashboardStatsDTO getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Active Reservations (Approved reservations)
        Long activeReservations = reservationRepository.findByUserAndStatus(user, ReservationStatus.APPROVED)
                .stream().count();
        
        // Borrowed Equipment (Currently borrowed)
        Long borrowedEquipment = borrowingRepository.findByUserAndStatus(user, BorrowingStatus.BORROWED)
                .stream().count();
        
        // Pending Requests (Pending reservations + Pending borrowings)
        Long pendingReservations = reservationRepository.findByUserAndStatus(user, ReservationStatus.PENDING)
                .stream().count();
        Long pendingBorrowings = borrowingRepository.findByUserAndStatus(user, BorrowingStatus.PENDING)
                .stream().count();
        Long pendingRequests = pendingReservations + pendingBorrowings;
        
        // Total Requests (All reservations + All borrowings)
        Long totalReservations = reservationRepository.findByUserOrderByReservationDateDescStartTimeDesc(user)
                .stream().count();
        Long totalBorrowings = borrowingRepository.findByUserOrderByBorrowDateDesc(user)
                .stream().count();
        Long totalRequests = totalReservations + totalBorrowings;
        
        return new DashboardStatsDTO(activeReservations, borrowedEquipment, pendingRequests, totalRequests);
    }
    
    private List<RecentRequestDTO> getRecentRequests(User user) {
        List<RecentRequestDTO> requests = new ArrayList<>();
        
        // Get recent facility reservations (top 3)
        List<FacilityReservation> recentReservations = 
            reservationRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        
        for (FacilityReservation res : recentReservations) {
            requests.add(new RecentRequestDTO(
                res.getId(),
                "FACILITY",
                res.getFacility().getName(),
                "Facility",
                res.getReservationDate().toString(),
                res.getStatus().name()
            ));
        }
        
        // Get recent equipment borrowings (top 2)
        List<EquipmentBorrowing> recentBorrowings = 
            borrowingRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        
        for (EquipmentBorrowing bor : recentBorrowings) {
            requests.add(new RecentRequestDTO(
                bor.getId(),
                "EQUIPMENT",
                bor.getEquipment().getName(),
                "Equipment",
                bor.getBorrowDate().toString(),
                bor.getStatus().name()
            ));
        }
        
        // Sort by date (most recent first) and limit to 5 only
        return requests.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(5)
                .collect(Collectors.toList());
    }
}
