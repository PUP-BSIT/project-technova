package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByStudentId(String studentId);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
    
    boolean existsByStudentId(String studentId);

    List<User> findByRole_Name(String roleName);
}