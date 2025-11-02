package com.campus.facility_reservation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentCategory category;
    
    @Column(name = "quantity_total", nullable = false)
    private Integer quantityTotal = 1;
    
    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable = 1;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url", length = 255)
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus status = EquipmentStatus.AVAILABLE;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum EquipmentCategory {
        AUDIO, VIDEO, COMPUTER, PROJECTOR, MICROPHONE, SPEAKER, OTHER
    }
    
    public enum EquipmentStatus {
        AVAILABLE, BORROWED, MAINTENANCE, UNAVAILABLE
    }
}