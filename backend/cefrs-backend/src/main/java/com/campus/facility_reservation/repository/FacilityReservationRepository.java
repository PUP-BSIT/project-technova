package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.FacilityReservation.ReservationStatus;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface FacilityReservationRepository extends JpaRepository<FacilityReservation, Long> {

    List<FacilityReservation> findByUserOrderByReservationDateDescStartTimeDesc(User user);

    List<FacilityReservation> findByUserAndStatus(User user, ReservationStatus status);

    List<FacilityReservation> findByFacilityOrderByReservationDateAscStartTimeAsc(Facility facility);

    List<FacilityReservation> findByStatusOrderByReservationDateAscStartTimeAsc(ReservationStatus status);

    List<FacilityReservation> findByReservationDate(LocalDate date);

    List<FacilityReservation> findByFacilityAndReservationDate(Facility facility, LocalDate date);

    @Query("SELECT fr FROM FacilityReservation fr WHERE fr.facility.id = :facilityId " +
            "AND fr.reservationDate = :date " +
            "AND fr.status = 'APPROVED' " +
            "AND ((fr.startTime < :endTime AND fr.endTime > :startTime))")
    List<FacilityReservation> findConflictingReservations(
            @Param("facilityId") Long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT fr FROM FacilityReservation fr WHERE fr.facility.id = :facilityId " +
            "AND fr.reservationDate = :date " +
            "AND fr.status = :status " +
            "AND ((fr.startTime < :endTime AND fr.endTime > :startTime)) " +
            "ORDER BY fr.createdAt ASC")
    List<FacilityReservation> findOverlappingByStatusOrderByCreatedAtAsc(
            @Param("facilityId") Long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") ReservationStatus status);

    List<FacilityReservation> findTop5ByUserOrderByCreatedAtDesc(User user);

    Long countByStatus(ReservationStatus status);

    @Query("SELECT COUNT(fr) FROM FacilityReservation fr WHERE fr.user = :user " +
            "AND fr.status IN ('PENDING', 'APPROVED')")
    Long countActiveReservationsByUser(@Param("user") User user);

    // For Reports Generation

    // Total reservations count
    @Query("SELECT COUNT(fr) FROM FacilityReservation fr")
    Long countTotalReservations();

    // Active reservations (APPROVED or PENDING)
    @Query("SELECT COUNT(fr) FROM FacilityReservation fr WHERE fr.status IN ('APPROVED', 'PENDING')")
    Long countActiveReservations();

    // Completed reservations
    @Query("SELECT COUNT(fr) FROM FacilityReservation fr WHERE fr.status = 'COMPLETED'")
    Long countCompletedReservations();

    // Daily reservation counts for chart (last 30 days)
    @Query("SELECT fr.reservationDate as date, COUNT(fr) as count " +
            "FROM FacilityReservation fr " +
            "WHERE fr.reservationDate >= :startDate " +
            "GROUP BY fr.reservationDate " +
            "ORDER BY fr.reservationDate")
    List<Object[]> getDailyReservationCounts(@Param("startDate") LocalDate startDate);

    // Hourly activity (for peak hours analysis)
    @Query("SELECT HOUR(fr.startTime) as hour, COUNT(fr) as count " +
            "FROM FacilityReservation fr " +
            "WHERE fr.status = 'APPROVED' " +
            "GROUP BY HOUR(fr.startTime) " +
            "ORDER BY count DESC")
    List<Object[]> getHourlyActivity();

    // Reservations by facility
    @Query("SELECT f.id, f.name, f.type, COUNT(fr) as totalReservations, " +
            "SUM(CASE WHEN fr.status = 'APPROVED' THEN 1 ELSE 0 END) as approved, " +
            "SUM(CASE WHEN fr.status = 'PENDING' THEN 1 ELSE 0 END) as pending, " +
            "SUM(CASE WHEN fr.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected " +
            "FROM FacilityReservation fr " +
            "JOIN fr.facility f " +
            "GROUP BY f.id, f.name, f.type " +
            "ORDER BY totalReservations DESC")
    List<Object[]> getFacilityUsageReport();

    // User activity report
    @Query("SELECT u.id, u.firstName, u.lastName, u.email, r.name, COUNT(fr), MAX(fr.createdAt) " +
            "FROM FacilityReservation fr " +
            "JOIN fr.user u " +
            "JOIN u.role r " +
            "GROUP BY u.id, u.firstName, u.lastName, u.email, r.name " +
            "ORDER BY COUNT(fr) DESC")
    List<Object[]> getUserActivityReport();

    // Today's reservations
    @Query("SELECT COUNT(fr) FROM FacilityReservation fr WHERE fr.reservationDate = :today")
    Long countTodayReservations(@Param("today") LocalDate today);

    // Unique users count
    @Query("SELECT COUNT(DISTINCT fr.user.id) FROM FacilityReservation fr")
    Long countUniqueUsers();

    /**
     * Count distinct facilities that have active (APPROVED) reservations
     */
    @Query("SELECT COUNT(DISTINCT fr.facility.id) FROM FacilityReservation fr WHERE fr.status = 'APPROVED'")
    Long countDistinctOccupiedFacilities();
}