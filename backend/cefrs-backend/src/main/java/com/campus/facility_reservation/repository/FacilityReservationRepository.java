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
           "AND fr.status NOT IN ('REJECTED', 'CANCELLED') " +
           "AND ((fr.startTime < :endTime AND fr.endTime > :startTime))")
    List<FacilityReservation> findConflictingReservations(
        @Param("facilityId") Long facilityId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    List<FacilityReservation> findTop5ByUserOrderByCreatedAtDesc(User user);
    
    Long countByStatus(ReservationStatus status);
    
    @Query("SELECT COUNT(fr) FROM FacilityReservation fr WHERE fr.user = :user " +
           "AND fr.status IN ('PENDING', 'APPROVED')")
    Long countActiveReservationsByUser(@Param("user") User user);
}
