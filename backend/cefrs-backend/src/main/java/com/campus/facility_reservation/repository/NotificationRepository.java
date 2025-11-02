package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.Notification;
import com.campus.facility_reservation.model.Notification.NotificationType;
import com.campus.facility_reservation.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndType(User user, NotificationType type);
    
    Long countByUserAndIsReadFalse(User user);
    
    List<Notification> findTop10ByUserOrderByCreatedAtDesc(User user);
}