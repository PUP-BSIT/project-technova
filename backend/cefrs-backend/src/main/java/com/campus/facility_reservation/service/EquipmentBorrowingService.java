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
        
        // Check availability
        if (equipment.getQuantityAvailable() < request.getQuantity()) {
            throw new RuntimeException("Not enough equipment available");
        }
        
        LocalDate borrowDate = LocalDate.parse(request.getBorrowDate());
        LocalDate returnDate = LocalDate.parse(request.getExpectedReturnDate());
        
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
        
        borrowing.setStatus(status);
        borrowing.setAdminNotes(approval.getAdminNotes());
        borrowing.setApprovedBy(admin);
        borrowing.setApprovedAt(LocalDateTime.now());
        
        Equipment equipment = borrowing.getEquipment();
        
        // Update equipment quantity
        if (status == BorrowingStatus.APPROVED && oldStatus == BorrowingStatus.PENDING) {
            // Deduct from available quantity
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() - borrowing.getQuantity());
            equipmentRepository.save(equipment);
        } else if (status == BorrowingStatus.RETURNED) {
            // Return to available quantity
            equipment.setQuantityAvailable(equipment.getQuantityAvailable() + borrowing.getQuantity());
            equipmentRepository.save(equipment);
            
            if (approval.getActualReturnDate() != null) {
                borrowing.setActualReturnDate(LocalDate.parse(approval.getActualReturnDate()));
            } else {
                borrowing.setActualReturnDate(LocalDate.now());
            }
        } else if (status == BorrowingStatus.REJECTED && oldStatus == BorrowingStatus.APPROVED) {
            // Return quantity if previously approved
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
