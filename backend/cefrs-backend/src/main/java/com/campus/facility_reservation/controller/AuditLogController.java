package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.AuditLogResponse;
import com.campus.facility_reservation.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4200")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/my-logs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyAuditLogs(Authentication authentication) {
        try {
            Long userId = (Long) authentication.getPrincipal();
            List<AuditLogResponse> auditLogs = auditLogService.getUserAuditLogs(userId);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching audit logs: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            List<AuditLogResponse> auditLogs = auditLogService.getAllAuditLogs();
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching all audit logs: " + e.getMessage());
        }
    }

    @GetMapping("/action/{actionType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAuditLogsByAction(@PathVariable String actionType) {
        try {
            List<AuditLogResponse> auditLogs = auditLogService.getAuditLogsByAction(actionType);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching audit logs by action: " + e.getMessage());
        }
    }

    @GetMapping("/table/{tableName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAuditLogsByTable(@PathVariable String tableName) {
        try {
            List<AuditLogResponse> auditLogs = auditLogService.getAuditLogsByTable(tableName);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching audit logs by table: " + e.getMessage());
        }
    }
}

