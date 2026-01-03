package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Facility;
import com.campus.facility_reservation.model.Facility.FacilityStatus;
import com.campus.facility_reservation.model.Facility.FacilityType;
import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.dto.FacilityDTO;
import com.campus.facility_reservation.repository.FacilityRepository;
import com.campus.facility_reservation.repository.FacilityReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.facility_reservation.annotation.Audited;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final FacilityReservationRepository reservationRepository;

    public List<FacilityDTO> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FacilityDTO> getAvailableFacilities() {
        // Return facilities that are either AVAILABLE or RESERVED so the
        // dashboard can show both. We avoid hiding facilities entirely.
        return facilityRepository.findAll().stream()
            .filter(facility -> facility.getStatus() == FacilityStatus.AVAILABLE
                || facility.getStatus() == FacilityStatus.RESERVED)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public FacilityDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        return convertToDTO(facility);
    }

    public List<FacilityDTO> searchFacilities(String name) {
        return facilityRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FacilityDTO> getFacilitiesByType(String type) {
        FacilityType facilityType = FacilityType.valueOf(type.toUpperCase());
        return facilityRepository.findByType(facilityType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Audited(action = "CREATE", table = "facility")
    @Transactional
    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        // Check for duplicate names
        List<Facility> existingFacilities = facilityRepository.findByNameContainingIgnoreCase(facilityDTO.getName());
        boolean exactMatch = existingFacilities.stream()
                .anyMatch(f -> f.getName().trim().equalsIgnoreCase(facilityDTO.getName().trim()));

        if (exactMatch) {
            throw new RuntimeException("A facility with the name '" + facilityDTO.getName() + "' already exists. Please use a different name.");
        }

        Facility facility = new Facility();
        facility.setName(facilityDTO.getName());
        facility.setType(FacilityType.valueOf(facilityDTO.getType().toUpperCase()));
        facility.setBuilding(facilityDTO.getBuilding());
        facility.setFloor(facilityDTO.getFloor());
        facility.setCapacity(facilityDTO.getCapacity());
        facility.setDescription(facilityDTO.getDescription());
        facility.setImageUrl(facilityDTO.getImageUrl());

        // Set status from DTO or default to AVAILABLE
        if (facilityDTO.getStatus() != null && !facilityDTO.getStatus().isEmpty()) {
            facility.setStatus(FacilityStatus.valueOf(facilityDTO.getStatus().toUpperCase()));
        } else {
            facility.setStatus(FacilityStatus.AVAILABLE);
        }

        Facility saved = facilityRepository.save(facility);
        return convertToDTO(saved);
    }

    @Audited(action = "UPDATE", table = "facility")
    @Transactional
    public FacilityDTO updateFacility(Long id, FacilityDTO facilityDTO) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));

        // Check for duplicate names (excluding current facility)
        List<Facility> existingFacilities = facilityRepository.findByNameContainingIgnoreCase(facilityDTO.getName());
        boolean duplicateExists = existingFacilities.stream()
                .anyMatch(f -> !f.getId().equals(id) && f.getName().trim().equalsIgnoreCase(facilityDTO.getName().trim()));

        if (duplicateExists) {
            throw new RuntimeException("A facility with the name '" + facilityDTO.getName() + "' already exists. Please use a different name.");
        }

        // If reducing capacity, check if it would affect active reservations
        if (facilityDTO.getCapacity() < facility.getCapacity()) {
            // Get active reservations for this facility
            List<FacilityReservation> activeReservations = reservationRepository
                    .findByFacilityOrderByReservationDateAscStartTimeAsc(facility).stream()
                    .filter(r -> r.getStatus() == ReservationStatus.APPROVED ||
                                 r.getStatus() == ReservationStatus.PENDING)
                    .collect(Collectors.toList());

            if (!activeReservations.isEmpty()) {
                throw new RuntimeException(
                    "Cannot reduce capacity: This facility has " + activeReservations.size() +
                    " active or pending reservation(s). Please ensure the new capacity can accommodate all reservations or cancel them first."
                );
            }
        }

        facility.setName(facilityDTO.getName());
        facility.setType(FacilityType.valueOf(facilityDTO.getType().toUpperCase()));
        facility.setBuilding(facilityDTO.getBuilding());
        facility.setFloor(facilityDTO.getFloor());
        facility.setCapacity(facilityDTO.getCapacity());
        facility.setDescription(facilityDTO.getDescription());
        facility.setImageUrl(facilityDTO.getImageUrl());

        // Update status from DTO
        if (facilityDTO.getStatus() != null && !facilityDTO.getStatus().isEmpty()) {
            facility.setStatus(FacilityStatus.valueOf(facilityDTO.getStatus().toUpperCase()));
        }

        Facility updated = facilityRepository.save(facility);
        return convertToDTO(updated);
    }

    @Audited(action = "DELETE", table = "facility")
    @Transactional
    public void deleteFacility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));

        // CRITICAL VALIDATION: Check for active or upcoming reservations
        List<FacilityReservation> allReservations = reservationRepository.findByFacilityOrderByReservationDateAscStartTimeAsc(facility);

        // Check for APPROVED reservations (confirmed bookings)
        List<FacilityReservation> approvedReservations = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.APPROVED)
                .collect(Collectors.toList());

        if (!approvedReservations.isEmpty()) {
            long futureCount = approvedReservations.stream()
                    .filter(r -> r.getReservationDate().isAfter(LocalDate.now()) ||
                                 r.getReservationDate().isEqual(LocalDate.now()))
                    .count();

            if (futureCount > 0) {
                throw new RuntimeException(
                    "Cannot delete facility '" + facility.getName() + "': " +
                    "It has " + futureCount + " active or upcoming approved reservation(s). " +
                    "Please cancel or complete all reservations before deleting this facility."
                );
            } else {
                throw new RuntimeException(
                    "Cannot delete facility '" + facility.getName() + "': " +
                    "It has " + approvedReservations.size() + " approved reservation(s). " +
                    "Please wait for all reservations to complete or cancel them before deleting."
                );
            }
        }

        // Check for PENDING reservations (awaiting approval)
        List<FacilityReservation> pendingReservations = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING)
                .collect(Collectors.toList());

        if (!pendingReservations.isEmpty()) {
            throw new RuntimeException(
                "Cannot delete facility '" + facility.getName() + "': " +
                "It has " + pendingReservations.size() + " pending reservation(s) awaiting approval. " +
                "Please process or cancel all pending reservations before deleting this facility."
            );
        }

        // Check for any other non-terminal reservations (WAITLISTED, OVERDUE)
        List<FacilityReservation> otherActiveReservations = allReservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.COMPLETED &&
                             r.getStatus() != ReservationStatus.CANCELLED &&
                             r.getStatus() != ReservationStatus.REJECTED)
                .collect(Collectors.toList());

        if (!otherActiveReservations.isEmpty()) {
            throw new RuntimeException(
                "Cannot delete facility '" + facility.getName() + "': " +
                "It has " + otherActiveReservations.size() + " active reservation(s) in various states. " +
                "Please ensure all reservations are cancelled, rejected, or completed before deleting."
            );
        }

        // If we reach here, facility has no active reservations and can be safely deleted
        facilityRepository.deleteById(id);
    }

    private FacilityDTO convertToDTO(Facility facility) {
        // Derive a presentation status: if there are approved upcoming or
        // today's reservations, show RESERVED for the dashboard. This does
        // not persistently change the facility's stored status.
        String derivedStatus = facility.getStatus().name();
        if (hasApprovedFutureReservations(facility)) {
            derivedStatus = Facility.FacilityStatus.RESERVED.name();
        }

        return new FacilityDTO(
            facility.getId(),
            facility.getName(),
            facility.getType().name(),
            facility.getBuilding(),
            facility.getFloor(),
            facility.getCapacity(),
            facility.getDescription(),
            facility.getImageUrl(),
            derivedStatus);
    }

        private boolean hasApprovedFutureReservations(Facility facility) {
        LocalDate today = LocalDate.now();
        return reservationRepository.findByFacilityOrderByReservationDateAscStartTimeAsc(facility).stream()
            .anyMatch(r -> r.getStatus() == ReservationStatus.APPROVED &&
                (r.getReservationDate().isAfter(today) || r.getReservationDate().isEqual(today)));
        }
}