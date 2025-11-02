package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.service.FacilityService;
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
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAllFacilities() {
        List<FacilityDTO> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(ApiResponse.success("Facilities retrieved successfully", facilities));
    }
    
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAvailableFacilities() {
        List<FacilityDTO> facilities = facilityService.getAvailableFacilities();
        return ResponseEntity.ok(ApiResponse.success("Available facilities retrieved", facilities));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> getFacilityById(@PathVariable Long id) {
        FacilityDTO facility = facilityService.getFacilityById(id);
        return ResponseEntity.ok(ApiResponse.success("Facility retrieved", facility));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> searchFacilities(@RequestParam String name) {
        List<FacilityDTO> facilities = facilityService.searchFacilities(name);
        return ResponseEntity.ok(ApiResponse.success("Search results", facilities));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getFacilitiesByType(@PathVariable String type) {
        List<FacilityDTO> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(ApiResponse.success("Facilities by type", facilities));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<FacilityDTO>> createFacility(@RequestBody FacilityRequestDTO request) {
        FacilityDTO facility = facilityService.createFacility(request);
        return ResponseEntity.ok(ApiResponse.success("Facility created successfully", facility));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> updateFacility(
            @PathVariable Long id,
            @RequestBody FacilityRequestDTO request) {
        FacilityDTO facility = facilityService.updateFacility(id, request);
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", facility));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully", null));
    }
}