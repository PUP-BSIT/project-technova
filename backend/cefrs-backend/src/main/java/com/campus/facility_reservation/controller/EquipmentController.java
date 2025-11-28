package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.EquipmentDTO;
import com.campus.facility_reservation.dto.EquipmentRequestDTO;
import com.campus.facility_reservation.dto.ApiResponse;
import com.campus.facility_reservation.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.campus.facility_reservation.service.EquipmentBorrowingService;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final EquipmentBorrowingService borrowingService;

    // Maximum Base64 image size (1.5MB in characters)
    private static final int MAX_IMAGE_SIZE = 1_500_000;

    // GET /api/equipment
    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentDTO>>> getAllEquipment() {
        List<EquipmentDTO> equipment = equipmentService.getAllEquipment();
        return ResponseEntity.ok(ApiResponse.success("Equipment retrieved successfully", equipment));
    }

    // GET /api/equipment/available
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<EquipmentDTO>>> getAvailableEquipment() {
        List<EquipmentDTO> equipment = equipmentService.getAvailableEquipment();
        return ResponseEntity.ok(ApiResponse.success("Available equipment retrieved", equipment));
    }

    // GET /api/equipment/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentDTO>> getEquipmentById(@PathVariable Long id) {
        EquipmentDTO equipment = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment retrieved", equipment));
    }

    // GET /api/equipment/{id}/bookings?start=YYYY-MM-DD&end=YYYY-MM-DD
    @GetMapping("/{id}/bookings")
    public ResponseEntity<ApiResponse<List<com.campus.facility_reservation.dto.EquipmentBorrowingDTO>>> getEquipmentBookings(
            @PathVariable Long id,
            @RequestParam String start,
            @RequestParam String end) {
        List<com.campus.facility_reservation.dto.EquipmentBorrowingDTO> bookings =
                borrowingService.getBookingsForEquipment(id, start, end);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved", bookings));
    }

    // GET /api/equipment/search?name=value
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EquipmentDTO>>> searchEquipment(@RequestParam String name) {
        List<EquipmentDTO> equipment = equipmentService.searchEquipment(name);
        return ResponseEntity.ok(ApiResponse.success("Search results", equipment));
    }

    // POST /api/equipment
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createEquipment(@RequestBody EquipmentRequestDTO request) {
        // Validate Base64 image size
        if (request.getImageUrl() != null && request.getImageUrl().length() > MAX_IMAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse
                            .error("Image size too large. Please use a smaller image (max 1MB after compression)."));
        }

        EquipmentDTO equipment = equipmentService.createEquipment(request);
        return ResponseEntity.ok(ApiResponse.success("Equipment created successfully", equipment));
    }

    // PUT /api/equipment/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateEquipment(
            @PathVariable Long id,
            @RequestBody EquipmentRequestDTO request) {
        // Validate Base64 image size
        if (request.getImageUrl() != null && request.getImageUrl().length() > MAX_IMAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse
                            .error("Image size too large. Please use a smaller image (max 1MB after compression)."));
        }

        EquipmentDTO equipment = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully", equipment));
    }

    // DELETE /api/equipment/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully", null));
    }
}