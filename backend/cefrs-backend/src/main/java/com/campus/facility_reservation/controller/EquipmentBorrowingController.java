package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.ApiResponse;
import com.campus.facility_reservation.dto.BorrowingApprovalDTO;
import com.campus.facility_reservation.dto.EquipmentBorrowingDTO;
import com.campus.facility_reservation.dto.EquipmentBorrowingRequestDTO;
import com.campus.facility_reservation.service.EquipmentBorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipment-borrowing")
@RequiredArgsConstructor
public class EquipmentBorrowingController {

    private final EquipmentBorrowingService borrowingService;

    // GET /api/equipment-borrowing
    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getAllBorrowings() {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getAllBorrowings();
        return ResponseEntity.ok(ApiResponse.success("Borrowings retrieved", borrowings));
    }

    // GET /api/equipment-borrowing/me
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getMyBorrowings(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getUserBorrowings(userId);
        return ResponseEntity.ok(ApiResponse.success("My borrowings retrieved", borrowings));
    }

    // GET /api/equipment-borrowing/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getUserBorrowings(@PathVariable Long userId) {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getUserBorrowings(userId);
        return ResponseEntity.ok(ApiResponse.success("User borrowings retrieved", borrowings));
    }

    // GET /api/equipment-borrowing/pending
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getPendingBorrowings() {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getPendingBorrowings();
        return ResponseEntity.ok(ApiResponse.success("Pending borrowings retrieved", borrowings));
    }

    // GET /api/equipment-borrowing/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> getBorrowingById(@PathVariable Long id) {
        EquipmentBorrowingDTO borrowing = borrowingService.getBorrowingById(id);
        return ResponseEntity.ok(ApiResponse.success("Borrowing retrieved", borrowing));
    }

    // POST /api/equipment-borrowing/user/{userId}
    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> createBorrowing(
            @PathVariable Long userId,
            @RequestBody EquipmentBorrowingRequestDTO request) {
        EquipmentBorrowingDTO borrowing = borrowingService.createBorrowing(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Borrowing request created", borrowing));
    }

    // POST /api/equipment-borrowing (for current user)
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ORGANIZATION')")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> createBorrowingForMe(
            Authentication authentication,
            @RequestBody EquipmentBorrowingRequestDTO request) {
        Long userId = (Long) authentication.getPrincipal();
        EquipmentBorrowingDTO borrowing = borrowingService.createBorrowing(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Borrowing request created", borrowing));
    }

    // PUT /api/equipment-borrowing/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> updateBorrowingStatus(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestBody BorrowingApprovalDTO approval) {
        EquipmentBorrowingDTO borrowing = borrowingService.updateBorrowingStatus(id, adminId, approval);
        return ResponseEntity.ok(ApiResponse.success("Borrowing status updated", borrowing));
    }

    // PUT /api/equipment-borrowing/{id}/status/admin (use current admin principal)
    @PutMapping("/{id}/status/admin")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> updateBorrowingStatusAsAdmin(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody BorrowingApprovalDTO approval) {
        Long adminId = (Long) authentication.getPrincipal();
        EquipmentBorrowingDTO borrowing = borrowingService.updateBorrowingStatus(id, adminId, approval);
        return ResponseEntity.ok(ApiResponse.success("Borrowing status updated", borrowing));
    }
}