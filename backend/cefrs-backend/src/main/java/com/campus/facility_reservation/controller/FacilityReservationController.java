package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.ApiResponse;
import com.campus.facility_reservation.dto.ReservationApprovalDTO;
import com.campus.facility_reservation.dto.FacilityReservationDTO;
import com.campus.facility_reservation.dto.FacilityReservationRequestDTO;
import com.campus.facility_reservation.service.FacilityReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityReservationController {

    private final FacilityReservationService reservationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityReservationDTO>>> getAllReservations() {
        List<FacilityReservationDTO> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved", reservations));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FacilityReservationDTO>>> getMyReservations(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<FacilityReservationDTO> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(ApiResponse.success("My reservations retrieved", reservations));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<FacilityReservationDTO>>> getUserReservations(@PathVariable Long userId) {
        List<FacilityReservationDTO> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(ApiResponse.success("User reservations retrieved", reservations));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<FacilityReservationDTO>>> getPendingReservations() {
        List<FacilityReservationDTO> reservations = reservationService.getPendingReservations();
        return ResponseEntity.ok(ApiResponse.success("Pending reservations retrieved", reservations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityReservationDTO>> getReservationById(@PathVariable Long id) {
        FacilityReservationDTO reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation retrieved", reservation));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ORGANIZATION','CAMPUS_ORGANIZATION')")
    public ResponseEntity<ApiResponse<FacilityReservationDTO>> createReservationForMe(
            Authentication authentication,
            @RequestBody FacilityReservationRequestDTO request) {
        Long userId = (Long) authentication.getPrincipal();
        FacilityReservationDTO reservation = reservationService.createReservation(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Reservation created successfully", reservation));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<FacilityReservationDTO>> createReservation(
            @PathVariable Long userId,
            @RequestBody FacilityReservationRequestDTO request) {
        FacilityReservationDTO reservation = reservationService.createReservation(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Reservation created successfully", reservation));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FacilityReservationDTO>> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestBody ReservationApprovalDTO approval) {
        FacilityReservationDTO reservation = reservationService.updateReservationStatus(id, adminId, approval);
        return ResponseEntity.ok(ApiResponse.success("Reservation status updated", reservation));
    }

    @PutMapping("/{id}/status/admin")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<FacilityReservationDTO>> updateReservationStatusAsAdmin(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody ReservationApprovalDTO approval) {
        Long adminId = (Long) authentication.getPrincipal();
        FacilityReservationDTO reservation = reservationService.updateReservationStatus(id, adminId, approval);
        return ResponseEntity.ok(ApiResponse.success("Reservation status updated", reservation));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable Long id,
            @RequestParam Long userId) {
        reservationService.cancelReservation(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", null));
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<FacilityReservationDTO>>> getAvailability(
            @RequestParam Long facilityId,
            @RequestParam String date) {
        List<FacilityReservationDTO> reservations = reservationService.getFacilityReservationsByDate(facilityId, date);
        return ResponseEntity.ok(ApiResponse.success("Facility availability retrieved", reservations));
    }
}
