package com.autorescue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 255)
    private String address;

    @Column(name = "default_vehicle_make", length = 80)
    private String defaultVehicleMake;

    @Column(name = "default_vehicle_model", length = 80)
    private String defaultVehicleModel;

    @Column(name = "default_vehicle_registration", length = 40)
    private String defaultVehicleRegistration;

    @Column(name = "default_vehicle_type", length = 40)
    private String defaultVehicleType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDefaultVehicleMake() { return defaultVehicleMake; }
    public void setDefaultVehicleMake(String defaultVehicleMake) { this.defaultVehicleMake = defaultVehicleMake; }

    public String getDefaultVehicleModel() { return defaultVehicleModel; }
    public void setDefaultVehicleModel(String defaultVehicleModel) { this.defaultVehicleModel = defaultVehicleModel; }

    public String getDefaultVehicleRegistration() { return defaultVehicleRegistration; }
    public void setDefaultVehicleRegistration(String defaultVehicleRegistration) { this.defaultVehicleRegistration = defaultVehicleRegistration; }

    public String getDefaultVehicleType() { return defaultVehicleType; }
    public void setDefaultVehicleType(String defaultVehicleType) { this.defaultVehicleType = defaultVehicleType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
