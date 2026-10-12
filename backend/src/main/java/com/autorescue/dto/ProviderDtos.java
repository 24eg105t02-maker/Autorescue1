package com.autorescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProviderDtos {

    public static class ProviderRegistrationRequest {
        @NotBlank(message = "Business name is required")
        private String businessName;

        @NotBlank(message = "License number is required")
        private String licenseNumber;

        @NotBlank(message = "Service area is required")
        private String serviceArea;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Supported service categories are required")
        private String supportedCategories;

        private Double latitude = 12.9716;
        private Double longitude = 77.5946;

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
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class AvailabilityRequest {
        @NotNull(message = "Availability flag is required")
        private Boolean available;
        private Double latitude;
        private Double longitude;

        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class AddVehicleRequest {
        @NotBlank(message = "Vehicle type is required")
        private String vehicleType;

        @NotBlank(message = "Make and model are required")
        private String makeModel;

        @NotBlank(message = "Registration number is required")
        private String registrationNumber;

        private Double capacityTons = 2.5;
        private String equipmentDetails;

        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getMakeModel() { return makeModel; }
        public void setMakeModel(String makeModel) { this.makeModel = makeModel; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public Double getCapacityTons() { return capacityTons; }
        public void setCapacityTons(Double capacityTons) { this.capacityTons = capacityTons; }
        public String getEquipmentDetails() { return equipmentDetails; }
        public void setEquipmentDetails(String equipmentDetails) { this.equipmentDetails = equipmentDetails; }
    }

    public static class VehicleDto {
        private Long id;
        private String vehicleType;
        private String makeModel;
        private String registrationNumber;
        private Double capacityTons;
        private String equipmentDetails;
        private boolean active;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getMakeModel() { return makeModel; }
        public void setMakeModel(String makeModel) { this.makeModel = makeModel; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public Double getCapacityTons() { return capacityTons; }
        public void setCapacityTons(Double capacityTons) { this.capacityTons = capacityTons; }
        public String getEquipmentDetails() { return equipmentDetails; }
        public void setEquipmentDetails(String equipmentDetails) { this.equipmentDetails = equipmentDetails; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class AddDocumentRequest {
        @NotBlank(message = "Document type is required")
        private String documentType;

        @NotBlank(message = "Document number is required")
        private String documentNumber;

        @NotBlank(message = "Document file URL is required")
        private String fileUrl;

        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
        public String getDocumentNumber() { return documentNumber; }
        public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    }

    public static class DocumentDto {
        private Long id;
        private String documentType;
        private String documentNumber;
        private String fileUrl;
        private String verificationStatus;
        private String uploadedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
        public String getDocumentNumber() { return documentNumber; }
        public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
        public String getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }
    }

    public static class ProviderProfileResponse {
        private Long id;
        private Long userId;
        private String ownerName;
        private String email;
        private String phone;
        private String businessName;
        private String licenseNumber;
        private String serviceArea;
        private String city;
        private Double latitude;
        private Double longitude;
        private String verificationStatus;
        private String verificationNotes;
        private boolean available;
        private String supportedCategories;
        private Double ratingAverage;
        private Integer totalReviews;
        private Integer totalCompletedJobs;
        private BigDecimal totalEarnings;
        private String createdAt;
        private List<VehicleDto> vehicles = new ArrayList<>();
        private List<DocumentDto> documents = new ArrayList<>();

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
        public String getServiceArea() { return serviceArea; }
        public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
        public String getVerificationNotes() { return verificationNotes; }
        public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
        public String getSupportedCategories() { return supportedCategories; }
        public void setSupportedCategories(String supportedCategories) { this.supportedCategories = supportedCategories; }
        public Double getRatingAverage() { return ratingAverage; }
        public void setRatingAverage(Double ratingAverage) { this.ratingAverage = ratingAverage; }
        public Integer getTotalReviews() { return totalReviews; }
        public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
        public Integer getTotalCompletedJobs() { return totalCompletedJobs; }
        public void setTotalCompletedJobs(Integer totalCompletedJobs) { this.totalCompletedJobs = totalCompletedJobs; }
        public BigDecimal getTotalEarnings() { return totalEarnings; }
        public void setTotalEarnings(BigDecimal totalEarnings) { this.totalEarnings = totalEarnings; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public List<VehicleDto> getVehicles() { return vehicles; }
        public void setVehicles(List<VehicleDto> vehicles) { this.vehicles = vehicles; }
        public List<DocumentDto> getDocuments() { return documents; }
        public void setDocuments(List<DocumentDto> documents) { this.documents = documents; }
    }
}
