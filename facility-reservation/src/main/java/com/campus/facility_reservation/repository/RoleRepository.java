package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.Role;
import com.campus.facility_reservation.model.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}