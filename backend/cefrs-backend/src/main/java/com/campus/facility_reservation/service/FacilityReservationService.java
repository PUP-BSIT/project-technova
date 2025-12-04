package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.*;
import com.campus.facility_reservation.model.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.dto.FacilityReservationDTO;
import com.campus.facility_reservation.dto.FacilityReservationRequestDTO;
import com.campus.facility_reservation.dto.ReservationApprovalDTO;
import com.campus.facility_reservation.dto.SuggestedFacilitiesDTO;
import com.campus.facility_reservation.dto.FacilityDTO;
import com.campus.facility_reservation.service.FacilityService;
import com.campus.facility_reservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityReservationService {
    
    private final FacilityReservationRepository reservationRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    
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

    // Get conflicting reservations for facility and time slot
    public List<FacilityReservationDTO> getConflictsForFacility(Long facilityId, String dateStr, String startTimeStr, String endTimeStr) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);
        
        List<FacilityReservation> conflicts = reservationRepository.findConflictingReservations(facilityId, date, startTime, endTime);
        return conflicts.stream().map(this::convertToDTO).collect(Collectors.toList());
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
        
        // Parse the datetime strings
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime startDateTime = LocalDateTime.parse(request.getStartTime(), formatter);
        LocalDateTime endDateTime = LocalDateTime.parse(request.getEndTime(), formatter);
        
        LocalDate date = startDateTime.toLocalDate();
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();

        FacilityReservation reservation = new FacilityReservation();
        reservation.setUser(user);
        reservation.setFacility(facility);
        reservation.setReservationDate(date);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setPurpose(request.getPurpose());

        // If there is already an APPROVED reservation for this slot, place new reservation on the waiting list
        List<FacilityReservation> approvedConflicts = reservationRepository.findConflictingReservations(
                facility.getId(), date, startTime, endTime
        );
        if (!approvedConflicts.isEmpty()) {
            reservation.setStatus(ReservationStatus.WAITLISTED);
        } else {
            reservation.setStatus(ReservationStatus.PENDING);
        }
        
        FacilityReservation saved = reservationRepository.save(reservation);
        return convertToDTO(saved);
    }
    
    @Transactional
    public FacilityReservationDTO updateReservationStatus(Long id, Long adminId, ReservationApprovalDTO approval) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        ReservationStatus status = ReservationStatus.valueOf(approval.getStatus().toUpperCase());
        ReservationStatus oldStatus = reservation.getStatus();

        // If approving now, check for conflicts against other APPROVED reservations
        if (status == ReservationStatus.APPROVED && oldStatus != ReservationStatus.APPROVED) {
            List<FacilityReservation> conflicts = reservationRepository.findConflictingReservations(
                reservation.getFacility().getId(),
                reservation.getReservationDate(),
                reservation.getStartTime(),
                reservation.getEndTime()
            );
            // Remove this reservation from conflicts (if it's already in there somehow)
            conflicts = conflicts.stream()
                .filter(c -> !c.getId().equals(reservation.getId()))
                .collect(Collectors.toList());
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Cannot approve: Time slot conflicts with existing approved reservation");
            }

            // Move any overlapping PENDING reservations into the waiting list for this slot
            List<FacilityReservation> pendingOverlaps = reservationRepository.findOverlappingByStatusOrderByCreatedAtAsc(
                    reservation.getFacility().getId(),
                    reservation.getReservationDate(),
                    reservation.getStartTime(),
                    reservation.getEndTime(),
                    ReservationStatus.PENDING
            );
            for (FacilityReservation other : pendingOverlaps) {
                if (!other.getId().equals(reservation.getId())) {
                    other.setStatus(ReservationStatus.WAITLISTED);
                    reservationRepository.save(other);
                }
            }
        }

        reservation.setStatus(status);
        reservation.setAdminNotes(approval.getAdminNotes());
        reservation.setApprovedBy(admin);
        reservation.setApprovedAt(LocalDateTime.now());
        
        FacilityReservation updated = reservationRepository.save(reservation);

        // If this reservation was APPROVED before and is now being changed to a non-APPROVED
        // terminal state, promote the next WAITLISTED reservation (if any) for this slot.
        if (oldStatus == ReservationStatus.APPROVED
                && (status == ReservationStatus.CANCELLED
                || status == ReservationStatus.REJECTED
                || status == ReservationStatus.COMPLETED)) {
            promoteNextFromWaitlist(reservation);
        }

        return convertToDTO(updated);
    }

    @Transactional
    public FacilityReservationDTO markAsCompletedByUser(Long id, Long userId) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to mark this reservation as completed");
        }

        // Only allow completing if approved or pending (some workflows may allow completion without an explicit approval)
        if (reservation.getStatus() != ReservationStatus.APPROVED && reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Reservation cannot be marked as completed in its current status");
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        FacilityReservation updated = reservationRepository.save(reservation);

        // When a reservation is completed, free the slot for the next in the waiting list
        promoteNextFromWaitlist(reservation);

        return convertToDTO(updated);
    }
    
    @Transactional
    public void cancelReservation(Long id, Long userId) {
        FacilityReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this reservation");
        }

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Only promote from waitlist if an APPROVED reservation has been cancelled
        if (oldStatus == ReservationStatus.APPROVED) {
            promoteNextFromWaitlist(reservation);
        }
    }

    public List<FacilityReservationDTO> getFacilityReservationsByDate(Long facilityId, String dateStr) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        LocalDate date = LocalDate.parse(dateStr);
        return reservationRepository.findByFacilityAndReservationDate(facility, date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Promote the next WAITLISTED reservation (if any) that overlaps the given reservation's
     * facility, date, and time range. The promoted reservation is moved back to PENDING so
     * that an admin can review and approve it explicitly.
     */
    private void promoteNextFromWaitlist(FacilityReservation releasedReservation) {
        List<FacilityReservation> waitlisted = reservationRepository.findOverlappingByStatusOrderByCreatedAtAsc(
                releasedReservation.getFacility().getId(),
                releasedReservation.getReservationDate(),
                releasedReservation.getStartTime(),
                releasedReservation.getEndTime(),
                ReservationStatus.WAITLISTED
        );

        if (!waitlisted.isEmpty()) {
            FacilityReservation next = waitlisted.get(0);
            next.setStatus(ReservationStatus.PENDING);
            // Clear any previous admin decision metadata just in case
            next.setApprovedBy(null);
            next.setApprovedAt(null);
            reservationRepository.save(next);
        }
    }

    public SuggestedFacilitiesDTO getSuggestedFacilities(Long unavailableFacilityId, String dateStr, String startTimeStr, String endTimeStr) {
        Facility unavailableFacility = facilityRepository.findById(unavailableFacilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        // Get all facilities
        List<Facility> allFacilities = facilityRepository.findAll();
        
        // Filter for available facilities with same or greater capacity and similar type
        List<FacilityDTO> suggestedFacilities = new ArrayList<>();
        
        for (Facility facility : allFacilities) {
            // Skip the unavailable facility
            if (facility.getId().equals(unavailableFacilityId)) {
                continue;
            }
            
            // Check if facility has same or greater capacity
            if (facility.getCapacity() < unavailableFacility.getCapacity()) {
                continue;
            }
            
            // Check for conflicts with the requested time slot
            List<FacilityReservation> conflicts = reservationRepository.findConflictingReservations(
                facility.getId(), date, startTime, endTime
            );
            
            // If no conflicts, add to suggested list
            if (conflicts.isEmpty()) {
                FacilityDTO dto = convertFacilityToDTO(facility);
                suggestedFacilities.add(dto);
            }
        }
        
        // Sort by capacity (facilities closer to the required capacity first)
        suggestedFacilities.sort(Comparator.comparingInt(f -> Math.abs(f.getCapacity() - unavailableFacility.getCapacity())));

        SuggestedFacilitiesDTO result = new SuggestedFacilitiesDTO();
        result.setUnavailableFacility(convertFacilityToDTO(unavailableFacility));
        result.setRequestedDate(dateStr);
        result.setRequestedStartTime(startTimeStr);
        result.setRequestedEndTime(endTimeStr);
        result.setReason("The requested facility is not available for the selected date and time slot");
        result.setSuggestedFacilities(suggestedFacilities);
        
        return result;
    }

    private FacilityDTO convertFacilityToDTO(Facility facility) {
        return new FacilityDTO(
            facility.getId(),
            facility.getName(),
            facility.getType().toString(),
            facility.getBuilding(),
            facility.getFloor(),
            facility.getCapacity(),
            facility.getDescription(),
            facility.getImageUrl(),
            "AVAILABLE"
        );
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