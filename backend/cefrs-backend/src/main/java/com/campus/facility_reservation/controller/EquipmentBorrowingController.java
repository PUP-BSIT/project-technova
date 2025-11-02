package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.service.EquipmentBorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipmentBorrowingController {
    
    private final EquipmentBorrowingService borrowingService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getAllBorrowings() {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getAllBorrowings();
        return ResponseEntity.ok(ApiResponse.success("Borrowings retrieved", borrowings));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getUserBorrowings(@PathVariable Long userId) {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getUserBorrowings(userId);
        return ResponseEntity.ok(ApiResponse.success("User borrowings retrieved", borrowings));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<EquipmentBorrowingDTO>>> getPendingBorrowings() {
        List<EquipmentBorrowingDTO> borrowings = borrowingService.getPendingBorrowings();
        return ResponseEntity.ok(ApiResponse.success("Pending borrowings retrieved", borrowings));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> getBorrowingById(@PathVariable Long id) {
        EquipmentBorrowingDTO borrowing = borrowingService.getBorrowingById(id);
        return ResponseEntity.ok(ApiResponse.success("Borrowing retrieved", borrowing));
    }
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> createBorrowing(
            @PathVariable Long userId,
            @RequestBody EquipmentBorrowingRequestDTO request) {
        EquipmentBorrowingDTO borrowing = borrowingService.createBorrowing(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Borrowing request created", borrowing));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EquipmentBorrowingDTO>> updateBorrowingStatus(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestBody BorrowingApprovalDTO approval) {
        EquipmentBorrowingDTO borrowing = borrowingService.updateBorrowingStatus(id, adminId, approval);
        return ResponseEntity.ok(ApiResponse.success("Borrowing status updated", borrowing));
    }
}
