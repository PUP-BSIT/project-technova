package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.AuditLogResponse;
import com.campus.facility_reservation.model.AuditLog;
import com.campus.facility_reservation.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AuditLog createAuditLog(Long userId, String actionType, String tableName, 
                                   Long recordId, String oldValues, String newValues, String ipAddress) {
        AuditLog auditLog = new AuditLog(userId, actionType, tableName, recordId, oldValues, newValues, ipAddress);
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLogResponse> getUserAuditLogs(Long userId) {
        List<AuditLog> auditLogs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    public List<AuditLogResponse> getAllAuditLogs() {
        List<AuditLog> auditLogs = auditLogRepository.findAll();
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    public List<AuditLogResponse> getAuditLogsByAction(String actionType) {
        List<AuditLog> auditLogs = auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    public List<AuditLogResponse> getAuditLogsByTable(String tableName) {
        List<AuditLog> auditLogs = auditLogRepository.findByTableNameOrderByCreatedAtDesc(tableName);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }
}

