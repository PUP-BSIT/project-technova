package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.FacilityDTO;
import com.campus.facility_reservation.dto.ApiResponse;
import com.campus.facility_reservation.service.FacilityService;
import com.campus.facility_reservation.service.FacilityReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityService facilityService;
    private final FacilityReservationService reservationService;

    // Maximum Base64 image size (1.5MB in characters)
    private static final int MAX_IMAGE_SIZE = 1_500_000;

    // GET /api/facilities
    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAllFacilities() {
        List<FacilityDTO> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(ApiResponse.success("Facilities retrieved successfully", facilities));
    }

    // GET /api/facilities/available
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAvailableFacilities() {
        List<FacilityDTO> facilities = facilityService.getAvailableFacilities();
        return ResponseEntity.ok(ApiResponse.success("Available facilities retrieved", facilities));
    }

    // GET /api/facilities/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> getFacilityById(@PathVariable Long id) {
        FacilityDTO facility = facilityService.getFacilityById(id);
        return ResponseEntity.ok(ApiResponse.success("Facility retrieved", facility));
    }

    // GET /api/facilities/{id}/conflicts?date=YYYY-MM-DD&startTime=HH:MM&endTime=HH:MM
    @GetMapping("/{id}/conflicts")
    public ResponseEntity<ApiResponse<List<com.campus.facility_reservation.dto.FacilityReservationDTO>>> getFacilityConflicts(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        List<com.campus.facility_reservation.dto.FacilityReservationDTO> conflicts =
                reservationService.getConflictsForFacility(id, date, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success("Conflicts retrieved", conflicts));
    }

    // GET /api/facilities/search?name=value
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> searchFacilities(@RequestParam String name) {
        List<FacilityDTO> facilities = facilityService.searchFacilities(name);
        return ResponseEntity.ok(ApiResponse.success("Search results", facilities));
    }

    // GET /api/facilities/type/{type}
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getFacilitiesByType(@PathVariable String type) {
        List<FacilityDTO> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(ApiResponse.success("Facilities by type", facilities));
    }

    // POST /api/facilities
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createFacility(@RequestBody FacilityDTO facilityDTO) {
        // Validate Base64 image size
        if (facilityDTO.getImageUrl() != null && facilityDTO.getImageUrl().length() > MAX_IMAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse
                            .error("Image size too large. Please use a smaller image (max 1MB after compression)."));
        }

        FacilityDTO facility = facilityService.createFacility(facilityDTO);
        return ResponseEntity.ok(ApiResponse.success("Facility created successfully", facility));
    }

    // PUT /api/facilities/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateFacility(
            @PathVariable Long id,
            @RequestBody FacilityDTO facilityDTO) {
        // Validate Base64 image size
        if (facilityDTO.getImageUrl() != null && facilityDTO.getImageUrl().length() > MAX_IMAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse
                            .error("Image size too large. Please use a smaller image (max 1MB after compression)."));
        }

        FacilityDTO facility = facilityService.updateFacility(id, facilityDTO);
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", facility));
    }

    // DELETE /api/facilities/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully", null));
    }
}