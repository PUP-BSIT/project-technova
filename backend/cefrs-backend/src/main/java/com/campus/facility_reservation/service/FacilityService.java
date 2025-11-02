package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Facility;
import com.campus.facility_reservation.model.Facility.FacilityStatus;
import com.campus.facility_reservation.model.Facility.FacilityType;
import com.campus.facility_reservation.dto.FacilityDTO;
import com.campus.facility_reservation.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {
    
    private final FacilityRepository facilityRepository;
    
    public List<FacilityDTO> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FacilityDTO> getAvailableFacilities() {
        return facilityRepository.findByStatus(FacilityStatus.AVAILABLE).stream()
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
    
    @Transactional
    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        Facility facility = new Facility();
        facility.setName(facilityDTO.getName());
        facility.setType(FacilityType.valueOf(facilityDTO.getType().toUpperCase()));
        facility.setBuilding(facilityDTO.getBuilding());
        facility.setFloor(facilityDTO.getFloor());
        facility.setCapacity(facilityDTO.getCapacity());
        facility.setDescription(facilityDTO.getDescription());
        facility.setImageUrl(facilityDTO.getImageUrl());
        facility.setStatus(FacilityStatus.AVAILABLE);
        
        Facility saved = facilityRepository.save(facility);
        return convertToDTO(saved);
    }
    
    @Transactional
    public FacilityDTO updateFacility(Long id, FacilityDTO facilityDTO) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        facility.setName(facilityDTO.getName());
        facility.setType(FacilityType.valueOf(facilityDTO.getType().toUpperCase()));
        facility.setBuilding(facilityDTO.getBuilding());
        facility.setFloor(facilityDTO.getFloor());
        facility.setCapacity(facilityDTO.getCapacity());
        facility.setDescription(facilityDTO.getDescription());
        facility.setImageUrl(facilityDTO.getImageUrl());
        
        Facility updated = facilityRepository.save(facility);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteFacility(Long id) {
        facilityRepository.deleteById(id);
    }
    
    private FacilityDTO convertToDTO(Facility facility) {
        return new FacilityDTO(
            facility.getId(),
            facility.getName(),
            facility.getType().name(),
            facility.getBuilding(),
            facility.getFloor(),
            facility.getCapacity(),
            facility.getDescription(),
            facility.getImageUrl(),
            facility.getStatus().name()
        );
    }
}