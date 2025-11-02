package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.DashboardDTO;
import com.campus.facility_reservation.dto.DashboardStatsDTO;
import com.campus.facility_reservation.dto.RecentRequestDTO;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.model.EquipmentBorrowing.BorrowingStatus;
import com.campus.facility_reservation.repository.EquipmentBorrowingRepository;
import com.campus.facility_reservation.repository.FacilityReservationRepository;
import com.campus.facility_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
        Long activeReservations = (long) reservationRepository.findByUserAndStatus(user, ReservationStatus.APPROVED).size();
        
        // Borrowed Equipment (Currently borrowed)
        Long borrowedEquipment = (long) borrowingRepository.findByUserAndStatus(user, BorrowingStatus.BORROWED).size();
        
        // Pending Requests (Pending reservations + Pending borrowings)
        Long pendingReservations = (long) reservationRepository.findByUserAndStatus(user, ReservationStatus.PENDING).size();
        Long pendingBorrowings = (long) borrowingRepository.findByUserAndStatus(user, BorrowingStatus.PENDING).size();
        Long pendingRequests = pendingReservations + pendingBorrowings;
        
        // Total Requests (All reservations + All borrowings)
        Long totalReservations = (long) reservationRepository.findByUserOrderByReservationDateDescStartTimeDesc(user).size();
        Long totalBorrowings = (long) borrowingRepository.findByUserOrderByBorrowDateDesc(user).size();
        Long totalRequests = totalReservations + totalBorrowings;
        
        return new DashboardStatsDTO(activeReservations, borrowedEquipment, pendingRequests, totalRequests);
    }
    
    private List<RecentRequestDTO> getRecentRequests(User user) {
        List<RecentRequestDTO> requests = new ArrayList<>();
        
        // Get recent facility reservations (top 5)
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
        
        // Get recent equipment borrowings (top 5)
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
