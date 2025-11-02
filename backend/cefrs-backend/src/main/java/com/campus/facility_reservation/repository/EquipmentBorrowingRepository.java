package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.EquipmentBorrowing.BorrowingStatus;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentBorrowingRepository extends JpaRepository<EquipmentBorrowing, Long> {
    
    List<EquipmentBorrowing> findByUserOrderByBorrowDateDesc(User user);
    
    List<EquipmentBorrowing> findByUserAndStatus(User user, BorrowingStatus status);
    
    List<EquipmentBorrowing> findByEquipmentOrderByBorrowDateDesc(Equipment equipment);
    
    List<EquipmentBorrowing> findByStatusOrderByBorrowDateAsc(BorrowingStatus status);
    
    @Query("SELECT eb FROM EquipmentBorrowing eb WHERE eb.status IN ('APPROVED', 'BORROWED') " +
           "AND eb.actualReturnDate IS NULL")
    List<EquipmentBorrowing> findActiveBorrowings();
    
    @Query("SELECT eb FROM EquipmentBorrowing eb WHERE eb.status = 'BORROWED' " +
           "AND eb.expectedReturnDate < :currentDate " +
           "AND eb.actualReturnDate IS NULL")
    List<EquipmentBorrowing> findOverdueBorrowings(@Param("currentDate") LocalDate currentDate);
    
    List<EquipmentBorrowing> findTop5ByUserOrderByCreatedAtDesc(User user);
    
    Long countByStatus(BorrowingStatus status);
    
    @Query("SELECT COUNT(eb) FROM EquipmentBorrowing eb WHERE eb.user = :user " +
           "AND eb.status IN ('PENDING', 'APPROVED', 'BORROWED')")
    Long countActiveBorrowingsByUser(@Param("user") User user);
    
    @Query("SELECT COALESCE(SUM(eb.quantity), 0) FROM EquipmentBorrowing eb " +
           "WHERE eb.equipment = :equipment " +
           "AND eb.status IN ('APPROVED', 'BORROWED')")
    Integer getTotalBorrowedQuantity(@Param("equipment") Equipment equipment);
}
