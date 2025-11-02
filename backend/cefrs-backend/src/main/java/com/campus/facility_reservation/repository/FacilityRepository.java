package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.Facility;
import com.campus.facility_reservation.model.Facility.FacilityStatus;
import com.campus.facility_reservation.model.Facility.FacilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    
    List<Facility> findByStatus(FacilityStatus status);
    
    List<Facility> findByType(FacilityType type);
    
    List<Facility> findByStatusOrderByNameAsc(FacilityStatus status);
    
    List<Facility> findByBuildingContainingIgnoreCase(String building);
    
    List<Facility> findByCapacityGreaterThanEqualAndStatus(Integer capacity, FacilityStatus status);
    
    List<Facility> findByNameContainingIgnoreCase(String name);
}