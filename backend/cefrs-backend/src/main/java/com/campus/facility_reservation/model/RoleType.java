package com.campus.facility_reservation.model;

public enum RoleType {
    STUDENT("View available equipment and facilities, submit requests, check status"),
    CAMPUS_ORGANIZATION("Submit requests for facilities, manage organization reservations"),
    ADMINISTRATOR("Approve/decline requests, manage availability, view reports"),
    SUPER_ADMIN("Manage users, configure policies, handle backups");

    private final String description;
    
    RoleType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}