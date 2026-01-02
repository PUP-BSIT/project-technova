package com.campus.facility_reservation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campus.facility_reservation.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByStudentId(String studentId);
    
    @Query("SELECT u FROM User u WHERE u.studentId IS NOT NULL AND UPPER(TRIM(u.studentId)) = UPPER(TRIM(:studentId))")
    Optional<User> findByStudentIdIgnoreCase(@Param("studentId") String studentId);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
    
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    boolean existsByStudentId(String studentId);

    List<User> findByRole_Name(String roleName);
}