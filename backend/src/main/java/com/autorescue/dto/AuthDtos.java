package com.autorescue.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Please enter a valid email address")
        private String email;

        @NotBlank(message = "Phone number is required")
        @Size(min = 8, max = 20, message = "Phone number must be between 8 and 20 characters")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        private String password;

        private String role = "CUSTOMER";
        private String address;
        private String defaultVehicleMake;
        private String defaultVehicleModel;
        private String defaultVehicleRegistration;
        private String defaultVehicleType;

        // Optional provider fields during registration
        private String businessName;
        private String licenseNumber;
        private String serviceArea;
        private String city;
        private String supportedCategories;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
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
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
        public String getServiceArea() { return serviceArea; }
        public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getSupportedCategories() { return supportedCategories; }
        public void setSupportedCategories(String supportedCategories) { this.supportedCategories = supportedCategories; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please enter a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UserSummaryDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private boolean active;
        private String address;
        private String defaultVehicleMake;
        private String defaultVehicleModel;
        private String defaultVehicleRegistration;
        private String defaultVehicleType;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
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
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private UserSummaryDto user;

        public AuthResponse() {}
        public AuthResponse(String token, UserSummaryDto user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public UserSummaryDto getUser() { return user; }
        public void setUser(UserSummaryDto user) { this.user = user; }
    }
}
