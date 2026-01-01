package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Equipment;
import com.campus.facility_reservation.model.Equipment.EquipmentCategory;
import com.campus.facility_reservation.model.Equipment.EquipmentStatus;
import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.EquipmentBorrowing.BorrowingStatus;
import com.campus.facility_reservation.dto.EquipmentDTO;
import com.campus.facility_reservation.dto.EquipmentRequestDTO;
import com.campus.facility_reservation.repository.EquipmentRepository;
import com.campus.facility_reservation.repository.EquipmentBorrowingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.facility_reservation.annotation.Audited;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.campus.facility_reservation.dto.SuggestedEquipmentDTO;

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
        // Check for duplicate names
        List<Equipment> existingEquipment = equipmentRepository.findByNameContainingIgnoreCase(request.getName());
        boolean exactMatch = existingEquipment.stream()
                .anyMatch(e -> e.getName().trim().equalsIgnoreCase(request.getName().trim()));

        if (exactMatch) {
            throw new RuntimeException("Equipment with the name '" + request.getName() + "' already exists. Please use a different name.");
        }

        Equipment equipment = new Equipment();
        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setQuantityAvailable(request.getQuantityTotal());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setLocation(request.getLocation());
        equipment.setSupplier(request.getSupplier());

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
                .orElseThrow(() -> new RuntimeException("Equipment not found with ID: " + id));

        // Check for duplicate names (excluding current equipment)
        List<Equipment> existingEquipment = equipmentRepository.findByNameContainingIgnoreCase(request.getName());
        boolean duplicateExists = existingEquipment.stream()
                .anyMatch(e -> !e.getId().equals(id) && e.getName().trim().equalsIgnoreCase(request.getName().trim()));

        if (duplicateExists) {
            throw new RuntimeException("Equipment with the name '" + request.getName() + "' already exists. Please use a different name.");
        }

        // CRITICAL VALIDATION: Check if reducing quantity below borrowed amount
        Integer currentBorrowed = borrowingRepository.getTotalBorrowedQuantity(equipment);
        int totalBorrowed = (currentBorrowed != null) ? currentBorrowed : 0;

        if (request.getQuantityTotal() < totalBorrowed) {
            throw new RuntimeException(
                "Cannot reduce total quantity to " + request.getQuantityTotal() +
                " because " + totalBorrowed + " item(s) are currently borrowed or approved for borrowing. " +
                "The new quantity must be at least " + totalBorrowed + ". " +
                "Please wait for items to be returned or cancel approved borrowings before reducing quantity."
            );
        }

        // Calculate new available quantity
        int newAvailable = request.getQuantityTotal() - totalBorrowed;
        if (newAvailable < 0) {
            newAvailable = 0;
        }

        equipment.setName(request.getName());
        equipment.setCategory(EquipmentCategory.valueOf(request.getCategory().toUpperCase()));
        equipment.setQuantityTotal(request.getQuantityTotal());
        equipment.setQuantityAvailable(newAvailable); // Recalculate based on borrowed items
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setLocation(request.getLocation());
        equipment.setSupplier(request.getSupplier());

        // Update status from request if provided
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            equipment.setStatus(EquipmentStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Equipment updated = equipmentRepository.save(equipment);
        return convertToDTO(updated);
    }

    @Audited(action = "DELETE", table = "equipment")
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with ID: " + id));

        // CRITICAL VALIDATION: Check for active or upcoming borrowings
        List<EquipmentBorrowing> allBorrowings = borrowingRepository.findByEquipmentOrderByBorrowDateDesc(equipment);

        // Check for APPROVED borrowings (confirmed but not yet borrowed)
        List<EquipmentBorrowing> approvedBorrowings = allBorrowings.stream()
                .filter(b -> b.getStatus() == BorrowingStatus.APPROVED)
                .collect(Collectors.toList());

        if (!approvedBorrowings.isEmpty()) {
            int totalApprovedQty = approvedBorrowings.stream()
                    .mapToInt(EquipmentBorrowing::getQuantity)
                    .sum();

            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                totalApprovedQty + " item(s) across " + approvedBorrowings.size() + " borrowing(s) have been approved for future use. " +
                "Please cancel or wait for these approved borrowings to complete before deleting."
            );
        }

        // Check for BORROWED items (currently in use)
        List<EquipmentBorrowing> borrowedItems = allBorrowings.stream()
                .filter(b -> b.getStatus() == BorrowingStatus.BORROWED)
                .collect(Collectors.toList());

        if (!borrowedItems.isEmpty()) {
            int totalBorrowedQty = borrowedItems.stream()
                    .mapToInt(EquipmentBorrowing::getQuantity)
                    .sum();

            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                totalBorrowedQty + " item(s) are currently borrowed by " + borrowedItems.size() + " user(s). " +
                "Please wait for all items to be returned before deleting this equipment."
            );
        }

        // Check for PENDING borrowings (awaiting approval)
        List<EquipmentBorrowing> pendingBorrowings = allBorrowings.stream()
                .filter(b -> b.getStatus() == BorrowingStatus.PENDING)
                .collect(Collectors.toList());

        if (!pendingBorrowings.isEmpty()) {
            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                "There are " + pendingBorrowings.size() + " pending borrowing request(s) awaiting approval. " +
                "Please process or cancel all pending requests before deleting this equipment."
            );
        }

        // Check for OVERDUE borrowings
        List<EquipmentBorrowing> overdueBorrowings = allBorrowings.stream()
                .filter(b -> b.getStatus() == BorrowingStatus.OVERDUE)
                .collect(Collectors.toList());

        if (!overdueBorrowings.isEmpty()) {
            int totalOverdueQty = overdueBorrowings.stream()
                    .mapToInt(EquipmentBorrowing::getQuantity)
                    .sum();

            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                totalOverdueQty + " item(s) are overdue across " + overdueBorrowings.size() + " borrowing(s). " +
                "Please resolve all overdue borrowings before deleting this equipment."
            );
        }

        // Check for any other non-terminal borrowings (WAITLISTED)
        List<EquipmentBorrowing> otherActiveBorrowings = allBorrowings.stream()
                .filter(b -> b.getStatus() != BorrowingStatus.RETURNED &&
                             b.getStatus() != BorrowingStatus.CANCELLED &&
                             b.getStatus() != BorrowingStatus.REJECTED)
                .collect(Collectors.toList());

        if (!otherActiveBorrowings.isEmpty()) {
            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                "There are " + otherActiveBorrowings.size() + " active borrowing(s) in various states. " +
                "Please ensure all borrowings are returned, cancelled, or rejected before deleting."
            );
        }

        // Additional safety check: verify quantityAvailable equals quantityTotal
        if (!equipment.getQuantityAvailable().equals(equipment.getQuantityTotal())) {
            throw new RuntimeException(
                "Cannot delete equipment '" + equipment.getName() + "': " +
                "Only " + equipment.getQuantityAvailable() + " out of " + equipment.getQuantityTotal() + " items are available. " +
                "Some items may still be in use. Please verify all items are returned."
            );
        }

        // If we reach here, equipment has no active borrowings and can be safely deleted
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
                equipment.getStatus().name(),
                equipment.getLocation(),
                equipment.getSupplier());
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