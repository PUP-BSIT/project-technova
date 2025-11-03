package com.campus.facility_reservation.repository;

import com.campus.facility_reservation.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findByActionTypeOrderByCreatedAtDesc(String actionType);
    List<AuditLog> findByTableNameOrderByCreatedAtDesc(String tableName);
}

