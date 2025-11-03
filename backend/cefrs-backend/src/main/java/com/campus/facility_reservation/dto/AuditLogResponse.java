package com.campus.facility_reservation.dto;

import com.campus.facility_reservation.model.AuditLog;
import java.time.LocalDateTime;

public class AuditLogResponse {
    private Long logId;
    private Long userId;
    private String userEmail;
    private String userName;
    private String actionType;
    private String tableName;
    private Long recordId;
    private String oldValues;
    private String newValues;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogResponse() {}

    public AuditLogResponse(AuditLog auditLog) {
        this.logId = auditLog.getLogId();
        this.userId = auditLog.getUserId();
        this.actionType = auditLog.getActionType();
        this.tableName = auditLog.getTableName();
        this.recordId = auditLog.getRecordId();
        this.oldValues = auditLog.getOldValues();
        this.newValues = auditLog.getNewValues();
        this.ipAddress = auditLog.getIpAddress();
        this.createdAt = auditLog.getCreatedAt();
        
        // Add user info if available
        if (auditLog.getUser() != null) {
            this.userEmail = auditLog.getUser().getEmail();
            this.userName = auditLog.getUser().getFirstName() + " " + auditLog.getUser().getLastName();
        }
    }

    // Getters and Setters
    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public String getOldValues() { return oldValues; }
    public void setOldValues(String oldValues) { this.oldValues = oldValues; }

    public String getNewValues() { return newValues; }
    public void setNewValues(String newValues) { this.newValues = newValues; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

