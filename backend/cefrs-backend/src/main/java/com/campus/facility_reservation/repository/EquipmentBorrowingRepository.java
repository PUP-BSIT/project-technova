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

       // Sum of quantities for borrowings that overlap the provided date range
       @Query("SELECT COALESCE(SUM(eb.quantity), 0) FROM EquipmentBorrowing eb " +
                     "WHERE eb.equipment = :equipment " +
                     "AND eb.status IN ('APPROVED', 'BORROWED') " +
                     "AND NOT (eb.expectedReturnDate < :borrowDate OR eb.borrowDate > :expectedReturnDate)")
       Integer getOverlappingBorrowedQuantity(@Param("equipment") Equipment equipment,
                                              @Param("borrowDate") java.time.LocalDate borrowDate,
                                              @Param("expectedReturnDate") java.time.LocalDate expectedReturnDate);

       // Return borrowings that overlap the provided date range (used to show booked ranges)
       @Query("SELECT eb FROM EquipmentBorrowing eb " +
                     "WHERE eb.equipment = :equipment " +
                     "AND eb.status IN ('APPROVED', 'BORROWED') " +
                     "AND NOT (eb.expectedReturnDate < :startDate OR eb.borrowDate > :endDate)")
       List<EquipmentBorrowing> findOverlappingBorrowings(@Param("equipment") Equipment equipment,
                                                          @Param("startDate") java.time.LocalDate startDate,
                                                          @Param("endDate") java.time.LocalDate endDate);

       // For Reports Generation

       // Total borrowings count
       @Query("SELECT COUNT(eb) FROM EquipmentBorrowing eb")
       Long countTotalBorrowings();

       // Active borrowings (APPROVED or BORROWED)
       @Query("SELECT COUNT(eb) FROM EquipmentBorrowing eb WHERE eb.status IN ('APPROVED', 'BORROWED')")
       Long countActiveBorrowings();

       // Overdue items count
       @Query("SELECT COUNT(eb) FROM EquipmentBorrowing eb " +
                     "WHERE eb.status = 'BORROWED' AND eb.expectedReturnDate < :today")
       Long countOverdueItems(@Param("today") LocalDate today);

       // Average borrowing duration in days
       @Query("SELECT AVG(DATEDIFF(eb.actualReturnDate, eb.borrowDate)) " +
                     "FROM EquipmentBorrowing eb " +
                     "WHERE eb.actualReturnDate IS NOT NULL")
       Double getAverageDurationInDays();

       // Daily borrowing counts for chart (last 30 days)
       @Query("SELECT eb.borrowDate as date, COUNT(eb) as count " +
                     "FROM EquipmentBorrowing eb " +
                     "WHERE eb.borrowDate >= :startDate " +
                     "GROUP BY eb.borrowDate " +
                     "ORDER BY eb.borrowDate")
       List<Object[]> getDailyBorrowingCounts(@Param("startDate") LocalDate startDate);

       // Equipment usage report
       @Query("SELECT e.id, e.name, e.category, e.quantityTotal, e.quantityAvailable, COUNT(eb), " +
                     "SUM(CASE WHEN eb.status = 'OVERDUE' THEN 1 ELSE 0 END) " +
                     "FROM EquipmentBorrowing eb " +
                     "JOIN eb.equipment e " +
                     "GROUP BY e.id, e.name, e.category, e.quantityTotal, e.quantityAvailable " +
                     "ORDER BY COUNT(eb) DESC")
       List<Object[]> getEquipmentUsageReport();

       // User borrowing activity
       @Query("SELECT u.id, u.firstName, u.lastName, u.email, r.name, COUNT(eb), MAX(eb.createdAt) " +
                     "FROM EquipmentBorrowing eb " +
                     "JOIN eb.user u " +
                     "JOIN u.role r " +
                     "GROUP BY u.id, u.firstName, u.lastName, u.email, r.name " +
                     "ORDER BY COUNT(eb) DESC")
       List<Object[]> getUserBorrowingReport();

       // Today's borrowings
       @Query("SELECT COUNT(eb) FROM EquipmentBorrowing eb WHERE eb.borrowDate = :today")
       Long countTodayBorrowings(@Param("today") LocalDate today);
}
