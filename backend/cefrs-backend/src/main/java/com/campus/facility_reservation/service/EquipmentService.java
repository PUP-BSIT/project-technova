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
import com.campus.facility_reservation.annotation.Audited;

import java.util.List;
import java.util.stream.Collectors;
import com.campus.facility_reservation.dto.SuggestedEquipmentDTO;
import com.campus.facility_reservation.repository.EquipmentBorrowingRepository;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentBorrowingRepository borrowingRepository;

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

    @Audited(action = "CREATE", table = "equipment")
    @Transactional
    public EquipmentDTO createEquipment(EquipmentRequestDTO request) {
        Equipment equipment = new Equipment();
        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setQuantityAvailable(request.getQuantityTotal());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());

        // Allow status to be set, default to AVAILABLE
        if (request.getStatus() != null) {
            equipment.setStatus(EquipmentStatus.valueOf(request.getStatus().toUpperCase()));
        } else {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }

        Equipment saved = equipmentRepository.save(equipment);
        return convertToDTO(saved);
    }

    @Audited(action = "UPDATE", table = "equipment")
    @Transactional
    public EquipmentDTO updateEquipment(Long id, EquipmentRequestDTO request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());

        // IMPORTANT: Set status from request, don't calculate it
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            equipment.setStatus(EquipmentStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // DO NOT auto-set status based on quantity here
        Equipment updated = equipmentRepository.save(equipment);
        return convertToDTO(updated);
    }

    @Audited(action = "DELETE", table = "equipment")
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
                equipment.getStatus().name());
    }

    /**
     * Provide suggested equipment alternatives for a given equipment id and date range.
     * This is a simple heuristic: return other equipment in the same category that have
     * quantityAvailable > 0 (excluding the original equipment).
     */
        public SuggestedEquipmentDTO getSuggestedEquipment(Long id, String borrowDate, String expectedReturnDate) {
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));

        LocalDate borrow = LocalDate.parse(borrowDate);
        LocalDate expected = LocalDate.parse(expectedReturnDate);

        List<EquipmentDTO> suggestions = equipmentRepository.findByCategory(equipment.getCategory()).stream()
            .filter(e -> !e.getId().equals(id))
            .filter(candidate -> {
                Integer overlapping = borrowingRepository.getOverlappingBorrowedQuantity(
                    equipmentRepository.getOne(candidate.getId()), borrow, expected);
                int reserved = overlapping != null ? overlapping : 0;
                int availableForRange = candidate.getQuantityTotal() - reserved;
                return availableForRange > 0;
            })
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        SuggestedEquipmentDTO dto = new SuggestedEquipmentDTO();
        dto.setUnavailableEquipment(convertToDTO(equipment));
        dto.setRequestedBorrowDate(borrowDate);
        dto.setRequestedReturnDate(expectedReturnDate);
        dto.setReason("Not enough equipment available for the requested date range");
        dto.setSuggestedEquipment(suggestions);
        return dto;
        }
}