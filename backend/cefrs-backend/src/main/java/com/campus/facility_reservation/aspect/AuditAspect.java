package com.campus.facility_reservation.aspect;

import com.campus.facility_reservation.annotation.Audited;
import com.campus.facility_reservation.service.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Aspect that intercepts methods annotated with @Audited
 * and automatically creates audit log entries
 */
@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Around("@annotation(com.campus.facility_reservation.annotation.Audited)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Audited audited = signature.getMethod().getAnnotation(Audited.class);

        // Get current user ID
        Long userId = getCurrentUserId();

        // Get IP address
        String ipAddress = getClientIpAddress();

        // Store old values (for UPDATE operations)
        String oldValues = null;

        // Execute the method
        Object result = joinPoint.proceed();

        // Log the action after successful execution
        try {
            Long recordId = extractRecordId(result);
            String newValues = buildNewValues(result);
            String message = buildMessage(audited, result);

            auditLogService.createAuditLog(
                    userId != null ? userId : 0L, // Use 0 for system actions
                    audited.action(),
                    audited.table(),
                    recordId,
                    oldValues,
                    newValues,
                    ipAddress);
        } catch (Exception e) {
            // Don't fail the main operation if audit logging fails
            System.err.println("Failed to create audit log: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    /**
     * Get the current authenticated user's ID
     */
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Long) {
                return (Long) auth.getPrincipal();
            }
        } catch (Exception e) {
            System.err.println("Error getting current user ID: " + e.getMessage());
        }
        return null;
    }

    /**
     * Get client IP address from the HTTP request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

                // Check for X-Forwarded-For header (for proxied requests)
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }

                // Check for X-Real-IP header
                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                    return xRealIp;
                }

                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            System.err.println("Error getting IP address: " + e.getMessage());
        }
        return "unknown";
    }

    /**
     * Extract record ID from the result object
     */
    private Long extractRecordId(Object result) {
        if (result == null)
            return null;

        try {
            // Try to get ID from DTO
            var idMethod = result.getClass().getMethod("getId");
            Object id = idMethod.invoke(result);

            if (id instanceof Long) {
                return (Long) id;
            } else if (id instanceof Number) {
                return ((Number) id).longValue();
            }
        } catch (Exception e) {
            // No getId method or error accessing it
        }

        return null;
    }

    /**
     * Build a JSON representation of the new values
     */
    private String buildNewValues(Object result) {
        if (result == null)
            return null;

        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return result.toString();
        }
    }

    /**
     * Build a human-readable message for the audit log
     */
    private String buildMessage(Audited audited, Object result) {
        StringBuilder message = new StringBuilder();
        message.append("Action: ").append(audited.action());
        message.append(" on table: ").append(audited.table());

        if (audited.description() != null && !audited.description().isEmpty()) {
            message.append(" - ").append(audited.description());
        }

        Long recordId = extractRecordId(result);
        if (recordId != null) {
            message.append(" (ID: ").append(recordId).append(")");
        }

        return message.toString();
    }
}