package com.campus.facility_reservation.model;

import jakarta.persistence.*;
import com.campus.facility_reservation.model.RoleType;

@Entity
@Table(name = "user_role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @Column(name = "role_name", unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleType name;

    @Column(columnDefinition = "text")
    private String description;

    public Role() {}

    public Role(RoleType name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RoleType getName() { return name; }
    public void setName(RoleType name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}