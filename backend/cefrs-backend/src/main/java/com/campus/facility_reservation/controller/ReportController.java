package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.ReportDTO;
import com.campus.facility_reservation.service.ReportService;
import com.campus.facility_reservation.service.AuditLogService;
import com.campus.facility_reservation.dto.AuditLogResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Get complete dashboard statistics
     * GET /api/reports/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ReportDTO.DashboardStats> getDashboardStats() {
        try {
            ReportDTO.DashboardStats stats = reportService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get facility usage statistics only
     * GET /api/reports/facility-usage
     */
    @GetMapping("/facility-usage")
    public ResponseEntity<ReportDTO.FacilityUsageStats> getFacilityUsageStats() {
        try {
            ReportDTO.FacilityUsageStats stats = reportService.getFacilityUsageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get equipment usage statistics only
     * GET /api/reports/equipment-usage
     */
    @GetMapping("/equipment-usage")
    public ResponseEntity<ReportDTO.EquipmentUsageStats> getEquipmentUsageStats() {
        try {
            ReportDTO.EquipmentUsageStats stats = reportService.getEquipmentUsageStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user activity statistics only
     * GET /api/reports/user-activity
     */
    @GetMapping("/user-activity")
    public ResponseEntity<ReportDTO.UserActivityStats> getUserActivityStats() {
        try {
            ReportDTO.UserActivityStats stats = reportService.getUserActivityStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get daily reservations for chart
     * GET /api/reports/daily-reservations?days=30
     */
    @GetMapping("/daily-reservations")
    public ResponseEntity<List<ReportDTO.DailyReservationCount>> getDailyReservations(
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<ReportDTO.DailyReservationCount> data = reportService.getDailyReservations(days);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed facility usage report
     * GET /api/reports/facilities
     */
    @GetMapping("/facilities")
    public ResponseEntity<List<ReportDTO.FacilityReport>> getFacilityReport() {
        try {
            List<ReportDTO.FacilityReport> report = reportService.getFacilityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed equipment usage report
     * GET /api/reports/equipment
     */
    @GetMapping("/equipment")
    public ResponseEntity<List<ReportDTO.EquipmentReport>> getEquipmentReport() {
        try {
            List<ReportDTO.EquipmentReport> report = reportService.getEquipmentReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user activity report
     * GET /api/reports/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<ReportDTO.UserActivityReport>> getUserActivityReport() {
        try {
            List<ReportDTO.UserActivityReport> report = reportService.getUserActivityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get audit logs with pagination
     * GET /api/reports/audit-logs?page=1&pageSize=10
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            // Get all audit logs
            List<AuditLogResponse> allLogs = auditLogService.getAllAuditLogs();

            // Calculate pagination
            int totalLogs = allLogs.size();
            int startIndex = (page - 1) * pageSize;
            int endIndex = Math.min(startIndex + pageSize, totalLogs);

            // Get paginated logs
            List<AuditLogResponse> paginatedLogs = allLogs.subList(startIndex, endIndex);

            // Calculate stats
            long todayCount = allLogs.stream()
                    .filter(log -> isToday(log.getCreatedAt()))
                    .count();

            long failedCount = allLogs.stream()
                    .filter(log -> "FAILED".equalsIgnoreCase(log.getActionType()))
                    .count();

            long uniqueUsers = allLogs.stream()
                    .map(AuditLogResponse::getUserId)
                    .distinct()
                    .count();

            // Build response
            Map<String, Object> response = new HashMap<>();

            // Stats
            List<Map<String, Object>> stats = List.of(
                    Map.of("label", "Total Actions", "value", totalLogs),
                    Map.of("label", "Today", "value", todayCount),
                    Map.of("label", "Failed Actions", "value", failedCount),
                    Map.of("label", "Unique Users", "value", uniqueUsers));

            // Transform logs to match frontend format
            List<Map<String, Object>> transformedLogs = paginatedLogs.stream()
                    .map(log -> {
                        Map<String, Object> logMap = new HashMap<>();
                        logMap.put("id", log.getLogId());
                        logMap.put("timestamp", log.getCreatedAt().toString());
                        logMap.put("user", log.getUserName() != null ? log.getUserName() : "Unknown");
                        logMap.put("action", formatAction(log.getActionType()));
                        logMap.put("module", formatModule(log.getTableName()));
                        logMap.put("details", formatDetails(log));
                        logMap.put("status", determineStatus(log.getActionType()));
                        return logMap;
                    })
                    .toList();

            response.put("stats", stats);
            response.put("logs", transformedLogs);
            response.put("totalLogs", totalLogs);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error fetching audit logs: " + e.getMessage()));
        }
    }

    private boolean isToday(java.time.LocalDateTime dateTime) {
        return dateTime.toLocalDate().equals(java.time.LocalDate.now());
    }

    private String formatAction(String actionType) {
        if (actionType == null)
            return "Unknown Action";

        switch (actionType.toUpperCase()) {
            case "INSERT":
                return "Create";
            case "UPDATE":
                return "Update";
            case "DELETE":
                return "Delete";
            case "LOGIN":
                return "Login";
            case "LOGOUT":
                return "Logout";
            case "FAILED_LOGIN":
                return "Failed Login";
            default:
                return actionType;
        }
    }

    private String formatModule(String tableName) {
        if (tableName == null)
            return "System";

        switch (tableName.toLowerCase()) {
            case "users":
                return "User";
            case "facility":
                return "Facility";
            case "facility_reservation":
                return "Facility";
            case "equipment":
                return "Equipment";
            case "equipment_borrowing":
                return "Equipment";
            case "user_role":
                return "User";
            default:
                return "System";
        }
    }

    private String formatDetails(AuditLogResponse log) {
        String action = formatAction(log.getActionType());
        String module = formatModule(log.getTableName());
        String user = log.getUserName() != null ? log.getUserName() : "Unknown user";

        if (log.getTableName() != null) {
            return String.format("%s %s in %s (Record ID: %s)",
                    action, module, log.getTableName(), log.getRecordId());
        }

        return String.format("%s performed by %s", action, user);
    }

    private String determineStatus(String actionType) {
        if (actionType == null)
            return "success";

        String action = actionType.toUpperCase();
        if (action.contains("FAILED") || action.equals("DELETE")) {
            return "failed";
        } else if (action.contains("WARNING") || action.contains("OVERDUE")) {
            return "warning";
        }
        return "success";
    }
}