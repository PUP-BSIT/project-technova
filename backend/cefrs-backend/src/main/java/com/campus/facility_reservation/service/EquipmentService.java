package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Equipment;
import com.campus.facility_reservation.model.Equipment.EquipmentCategory;
import com.campus.facility_reservation.model.Equipment.EquipmentStatus;
import com.campus.facility_reservation.dto.EquipmentDTO;
import com.campus.facility_reservation.dto.EquipmentRequestDTO;
import com.campus.facility_reservation.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {
    
    private final EquipmentRepository equipmentRepository;
    
    public List<EquipmentDTO> getAllEquipment() {
        return equipmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<EquipmentDTO> getAvailableEquipment() {
        return equipmentRepository.findByQuantityAvailableGreaterThan(0).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EquipmentDTO getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return convertToDTO(equipment);
    }
    
    public List<EquipmentDTO> searchEquipment(String name) {
        return equipmentRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public EquipmentDTO createEquipment(EquipmentRequestDTO request) {
        Equipment equipment = new Equipment();
        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setQuantityAvailable(request.getQuantityTotal());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        
        Equipment saved = equipmentRepository.save(equipment);
        return convertToDTO(saved);
    }
    
    @Transactional
    public EquipmentDTO updateEquipment(Long id, EquipmentRequestDTO request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());
        
        Equipment updated = equipmentRepository.save(equipment);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
    
    private EquipmentDTO convertToDTO(Equipment equipment) {
        return new EquipmentDTO(
            equipment.getId(),
            equipment.getName(),
            equipment.getCategory().name(),
            equipment.getQuantityTotal(),
            equipment.getQuantityAvailable(),
            equipment.getDescription(),
            equipment.getImageUrl(),
            equipment.getStatus().name()
        );
    }
}