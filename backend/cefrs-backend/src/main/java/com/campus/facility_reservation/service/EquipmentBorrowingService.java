package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.*;
import com.campus.facility_reservation.model.Equipment;
import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.model.EquipmentBorrowing.BorrowingStatus;
import com.campus.facility_reservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.facility_reservation.dto.EquipmentBorrowingRequestDTO;
import com.campus.facility_reservation.dto.BorrowingApprovalDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentBorrowingService {
    
    private final EquipmentBorrowingRepository borrowingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public List<EquipmentBorrowingDTO> getAllBorrowings() {
        return borrowingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Return overlapping bookings for an equipment within a date range
    public List<EquipmentBorrowingDTO> getBookingsForEquipment(Long equipmentId, String startDateStr, String endDateStr) {
        java.time.LocalDate startDate = java.time.LocalDate.parse(startDateStr);
        java.time.LocalDate endDate = java.time.LocalDate.parse(endDateStr);
        com.campus.facility_reservation.model.Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        List<com.campus.facility_reservation.model.EquipmentBorrowing> bookings = borrowingRepository.findOverlappingBorrowings(equipment, startDate, endDate);
        return bookings.stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }
    
    public List<EquipmentBorrowingDTO> getUserBorrowings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return borrowingRepository.findByUserOrderByBorrowDateDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<EquipmentBorrowingDTO> getPendingBorrowings() {
        return borrowingRepository.findByStatusOrderByBorrowDateAsc(BorrowingStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EquipmentBorrowingDTO getBorrowingById(Long id) {
        EquipmentBorrowing borrowing = borrowingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));
        return convertToDTO(borrowing);
    }
    
    @Transactional
    public EquipmentBorrowingDTO createBorrowing(Long userId, EquipmentBorrowingRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        LocalDate borrowDate = LocalDate.parse(request.getBorrowDate());
        LocalDate returnDate = LocalDate.parse(request.getExpectedReturnDate());

        // Check availability for the requested date range by summing overlapping approved/borrowed quantities
        Integer overlapping = borrowingRepository.getOverlappingBorrowedQuantity(equipment, borrowDate, returnDate);
        int availableForRange = equipment.getQuantityTotal() - (overlapping != null ? overlapping : 0);
        if (availableForRange < request.getQuantity()) {
            throw new RuntimeException("Not enough equipment available for the requested date range");
        }
        
        EquipmentBorrowing borrowing = new EquipmentBorrowing();
        borrowing.setUser(user);
        borrowing.setEquipment(equipment);
        borrowing.setQuantity(request.getQuantity());
        borrowing.setBorrowDate(borrowDate);
        borrowing.setExpectedReturnDate(returnDate);
        borrowing.setPurpose(request.getPurpose());
        borrowing.setStatus(BorrowingStatus.PENDING);
        
        EquipmentBorrowing saved = borrowingRepository.save(borrowing);
        
        // Send notification
        notificationService.createBorrowingNotification(user, saved);
        
        return convertToDTO(saved);
    }
    
    @Transactional
    public EquipmentBorrowingDTO updateBorrowingStatus(Long id, Long adminId, BorrowingApprovalDTO approval) {
        EquipmentBorrowing borrowing = borrowingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        BorrowingStatus status = BorrowingStatus.valueOf(approval.getStatus().toUpperCase());
        BorrowingStatus oldStatus = borrowing.getStatus();

        // If approving now, ensure approved+borrowed overlapping quantities + this request <= total
        if (status == BorrowingStatus.APPROVED && oldStatus != BorrowingStatus.APPROVED) {
            Equipment equipment = borrowing.getEquipment();
            Integer overlapping = borrowingRepository.getOverlappingBorrowedQuantity(equipment, borrowing.getBorrowDate(), borrowing.getExpectedReturnDate());
            int alreadyReserved = overlapping != null ? overlapping : 0;
            // overlapping does NOT include this borrowing (it hasn't been approved yet), so check capacity
            if (alreadyReserved + borrowing.getQuantity() > equipment.getQuantityTotal()) {
                throw new RuntimeException("Not enough equipment available to approve this request for the selected dates");
            }
        }

        borrowing.setStatus(status);
        borrowing.setAdminNotes(approval.getAdminNotes());
        borrowing.setApprovedBy(admin);
        borrowing.setApprovedAt(LocalDateTime.now());

        Equipment equipment = borrowing.getEquipment();

        // Update equipment quantity only when the item is actually BORROWED or RETURNED
        if (status == BorrowingStatus.BORROWED && oldStatus != BorrowingStatus.BORROWED) {
            // Before marking as BORROWED ensure availability still holds for the borrow period
            Integer overlapping = borrowingRepository.getOverlappingBorrowedQuantity(equipment, borrowing.getBorrowDate(), borrowing.getExpectedReturnDate());
            int alreadyBorrowed = overlapping != null ? overlapping : 0;
            // If the previous state was APPROVED and already counted in overlapping, subtract it
            if (oldStatus == BorrowingStatus.APPROVED) {
                alreadyBorrowed -= borrowing.getQuantity();
            }
            if (alreadyBorrowed + borrowing.getQuantity() > equipment.getQuantityTotal()) {
                throw new RuntimeException("Not enough equipment available to mark as borrowed");
            }
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() - borrowing.getQuantity());
            equipmentRepository.save(equipment);
        } else if (status == BorrowingStatus.RETURNED && oldStatus == BorrowingStatus.BORROWED) {
            // Return to available quantity
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() + borrowing.getQuantity());
            equipmentRepository.save(equipment);

            if (approval.getActualReturnDate() != null) {
                borrowing.setActualReturnDate(LocalDate.parse(approval.getActualReturnDate()));
            } else {
                borrowing.setActualReturnDate(LocalDate.now());
            }
        } else if (status == BorrowingStatus.REJECTED && oldStatus == BorrowingStatus.APPROVED) {
            // Return quantity if previously approved AND it was deducted earlier (legacy paths)
            // In current flow we don't deduct on APPROVED, so this mainly protects older data.
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() + borrowing.getQuantity());
            equipmentRepository.save(equipment);
        }
        
        EquipmentBorrowing updated = borrowingRepository.save(borrowing);
        
        // Send notification
        notificationService.createBorrowingStatusNotification(borrowing.getUser(), updated);
        
        return convertToDTO(updated);
    }

    @Transactional
    public EquipmentBorrowingDTO markAsReturnedByUser(Long id, Long userId) {
        EquipmentBorrowing borrowing = borrowingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));

        if (!borrowing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to mark this borrowing as returned");
        }

        // Only allow marking returned if it was approved/borrowed
        BorrowingStatus status = borrowing.getStatus();
        if (status != BorrowingStatus.APPROVED && status != BorrowingStatus.BORROWED && status != BorrowingStatus.OVERDUE) {
            throw new RuntimeException("Borrowing cannot be marked as returned in its current status");
        }

        // Update equipment quantity
        Equipment equipment = borrowing.getEquipment();
        equipment.setQuantityAvailable(equipment.getQuantityAvailable() + borrowing.getQuantity());
        equipmentRepository.save(equipment);

        borrowing.setStatus(BorrowingStatus.RETURNED);
        borrowing.setActualReturnDate(LocalDate.now());

        EquipmentBorrowing updated = borrowingRepository.save(borrowing);

        // Send notification
        notificationService.createBorrowingStatusNotification(borrowing.getUser(), updated);

        return convertToDTO(updated);
    }
    
    private EquipmentBorrowingDTO convertToDTO(EquipmentBorrowing borrowing) {
        return new EquipmentBorrowingDTO(
            borrowing.getId(),
            borrowing.getUser().getId(),
            borrowing.getUser().getFirstName() + " " + borrowing.getUser().getLastName(),
            borrowing.getEquipment().getId(),
            borrowing.getEquipment().getName(),
            borrowing.getQuantity(),
            borrowing.getBorrowDate().toString(),
            borrowing.getExpectedReturnDate().toString(),
            borrowing.getActualReturnDate() != null ? borrowing.getActualReturnDate().toString() : null,
            borrowing.getPurpose(),
            borrowing.getStatus().name(),
            borrowing.getAdminNotes(),
            borrowing.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME)
        );
    }
}
