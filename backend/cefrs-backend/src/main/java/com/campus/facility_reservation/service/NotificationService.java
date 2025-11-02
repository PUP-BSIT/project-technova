package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.NotificationDTO;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.Notification;
import com.campus.facility_reservation.model.Notification.NotificationType;
import com.campus.facility_reservation.model.Notification.ReferenceType;
import com.campus.facility_reservation.repository.NotificationRepository;
import com.campus.facility_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
    
    @Transactional
    public void createReservationNotification(User user, FacilityReservation reservation) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.RESERVATION);
        notification.setTitle("Reservation Request Submitted");
        notification.setMessage("Your reservation for " + reservation.getFacility().getName() + " has been submitted and is pending approval.");
        notification.setReferenceId(reservation.getId());
        notification.setReferenceType(ReferenceType.FACILITY_RESERVATION);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void createReservationStatusNotification(User user, FacilityReservation reservation) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.RESERVATION);
        notification.setTitle("Reservation " + reservation.getStatus().name());
        notification.setMessage("Your reservation for " + reservation.getFacility().getName() + " has been " + reservation.getStatus().name().toLowerCase() + ".");
        notification.setReferenceId(reservation.getId());
        notification.setReferenceType(ReferenceType.FACILITY_RESERVATION);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void createBorrowingNotification(User user, EquipmentBorrowing borrowing) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.BORROWING);
        notification.setTitle("Borrowing Request Submitted");
        notification.setMessage("Your borrowing request for " + borrowing.getEquipment().getName() + " has been submitted and is pending approval.");
        notification.setReferenceId(borrowing.getId());
        notification.setReferenceType(ReferenceType.EQUIPMENT_BORROWING);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void createBorrowingStatusNotification(User user, EquipmentBorrowing borrowing) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.BORROWING);
        notification.setTitle("Borrowing " + borrowing.getStatus().name());
        notification.setMessage("Your borrowing request for " + borrowing.getEquipment().getName() + " has been " + borrowing.getStatus().name().toLowerCase() + ".");
        notification.setReferenceId(borrowing.getId());
        notification.setReferenceType(ReferenceType.EQUIPMENT_BORROWING);
        notificationRepository.save(notification);
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
            notification.getId(),
            notification.getType().name(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getReferenceId(),
            notification.getReferenceType() != null ? notification.getReferenceType().name() : null,
            notification.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME)
        );
    }
}
