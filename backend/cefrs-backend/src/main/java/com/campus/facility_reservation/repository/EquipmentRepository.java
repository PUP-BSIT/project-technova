package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.Equipment;
import com.campus.facility_reservation.model.Equipment.EquipmentCategory;
import com.campus.facility_reservation.model.Equipment.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    
    List<Equipment> findByStatus(EquipmentStatus status);
    
    List<Equipment> findByCategory(EquipmentCategory category);
    
    List<Equipment> findByQuantityAvailableGreaterThan(Integer quantity);
    
    List<Equipment> findByStatusAndCategory(EquipmentStatus status, EquipmentCategory category);
    
    List<Equipment> findByNameContainingIgnoreCase(String name);
    
    List<Equipment> findByStatusOrderByNameAsc(EquipmentStatus status);
}