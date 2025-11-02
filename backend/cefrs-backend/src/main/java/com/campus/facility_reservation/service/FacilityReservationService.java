package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.entity.*;
import com.campus.facility_reservation.entity.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityReservationService {
    
    private final FacilityReservationRepository reservationRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public List<FacilityReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FacilityReservationDTO> getUserReservations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reservationRepository.findByUserOrderByReservationDateDescStartTimeDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FacilityReservationDTO> getPendingReservations() {
        return reservationRepository.findByStatusOrderByReservationDateAscStartTimeAsc(ReservationStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public FacilityReservationDTO getReservationById(Long id) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        return convertToDTO(reservation);
    }
    
    @Transactional
    public FacilityReservationDTO createReservation(Long userId, FacilityReservationRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        LocalDate date = LocalDate.parse(request.getReservationDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());
        
        // Check for conflicts
        List<FacilityReservation> conflicts = reservationRepository.findConflictingReservations(
            facility.getId(), date, startTime, endTime
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot is already reserved");
        }
        
        FacilityReservation reservation = new FacilityReservation();
        reservation.setUser(user);
        reservation.setFacility(facility);
        reservation.setReservationDate(date);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setPurpose(request.getPurpose());
        reservation.setStatus(ReservationStatus.PENDING);
        
        FacilityReservation saved = reservationRepository.save(reservation);
        
        // Send notification
        notificationService.createReservationNotification(user, saved);
        
        return convertToDTO(saved);
    }
    
    @Transactional
    public FacilityReservationDTO updateReservationStatus(Long id, Long adminId, ReservationApprovalDTO approval) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        ReservationStatus status = ReservationStatus.valueOf(approval.getStatus().toUpperCase());
        reservation.setStatus(status);
        reservation.setAdminNotes(approval.getAdminNotes());
        reservation.setApprovedBy(admin);
        reservation.setApprovedAt(LocalDateTime.now());
        
        FacilityReservation updated = reservationRepository.save(reservation);
        
        // Send notification
        notificationService.createReservationStatusNotification(reservation.getUser(), updated);
        
        return convertToDTO(updated);
    }
    
    @Transactional
    public void cancelReservation(Long id, Long userId) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this reservation");
        }
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
    
    private FacilityReservationDTO convertToDTO(FacilityReservation reservation) {
        return new FacilityReservationDTO(
            reservation.getId(),
            reservation.getUser().getId(),
            reservation.getUser().getFirstName() + " " + reservation.getUser().getLastName(),
            reservation.getFacility().getId(),
            reservation.getFacility().getName(),
            reservation.getReservationDate().toString(),
            reservation.getStartTime().toString(),
            reservation.getEndTime().toString(),
            reservation.getPurpose(),
            reservation.getStatus().name(),
            reservation.getAdminNotes(),
            reservation.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME)
        );
    }
}
