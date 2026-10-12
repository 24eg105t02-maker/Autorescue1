package com.autorescue.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ServiceDtos {

    public static class ServiceCategoryDto {
        private Long id;
        private String code;
        private String name;
        private String description;
        private String supportedVehicleTypes;
        private BigDecimal baseFee;
        private BigDecimal ratePerKm;
        private BigDecimal additionalCharges;
        private Integer estimatedEtaMinutes;
        private boolean active;
        private String iconName;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSupportedVehicleTypes() { return supportedVehicleTypes; }
        public void setSupportedVehicleTypes(String supportedVehicleTypes) { this.supportedVehicleTypes = supportedVehicleTypes; }
        public BigDecimal getBaseFee() { return baseFee; }
        public void setBaseFee(BigDecimal baseFee) { this.baseFee = baseFee; }
        public BigDecimal getRatePerKm() { return ratePerKm; }
        public void setRatePerKm(BigDecimal ratePerKm) { this.ratePerKm = ratePerKm; }
        public BigDecimal getAdditionalCharges() { return additionalCharges; }
        public void setAdditionalCharges(BigDecimal additionalCharges) { this.additionalCharges = additionalCharges; }
        public Integer getEstimatedEtaMinutes() { return estimatedEtaMinutes; }
        public void setEstimatedEtaMinutes(Integer estimatedEtaMinutes) { this.estimatedEtaMinutes = estimatedEtaMinutes; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
    }

    public static class UpsertServiceCategoryRequest {
        @NotBlank(message = "Service code is required")
        private String code;
        @NotBlank(message = "Service name is required")
        private String name;
        @NotBlank(message = "Description is required")
        private String description;
        @NotBlank(message = "Supported vehicle types are required")
        private String supportedVehicleTypes;
        @NotNull(message = "Base fee is required")
        @DecimalMin(value = "0.0", message = "Base fee must be non-negative")
        private BigDecimal baseFee;
        @NotNull(message = "Rate per km is required")
        @DecimalMin(value = "0.0", message = "Rate per km must be non-negative")
        private BigDecimal ratePerKm;
        @NotNull(message = "Additional charges are required")
        private BigDecimal additionalCharges;
        private Integer estimatedEtaMinutes = 25;
        private boolean active = true;
        private String iconName = "Truck";

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSupportedVehicleTypes() { return supportedVehicleTypes; }
        public void setSupportedVehicleTypes(String supportedVehicleTypes) { this.supportedVehicleTypes = supportedVehicleTypes; }
        public BigDecimal getBaseFee() { return baseFee; }
        public void setBaseFee(BigDecimal baseFee) { this.baseFee = baseFee; }
        public BigDecimal getRatePerKm() { return ratePerKm; }
        public void setRatePerKm(BigDecimal ratePerKm) { this.ratePerKm = ratePerKm; }
        public BigDecimal getAdditionalCharges() { return additionalCharges; }
        public void setAdditionalCharges(BigDecimal additionalCharges) { this.additionalCharges = additionalCharges; }
        public Integer getEstimatedEtaMinutes() { return estimatedEtaMinutes; }
        public void setEstimatedEtaMinutes(Integer estimatedEtaMinutes) { this.estimatedEtaMinutes = estimatedEtaMinutes; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
    }

    public static class PriceEstimateRequest {
        @NotNull(message = "Service category ID is required")
        private Long serviceCategoryId;
        @NotNull(message = "Distance in km is required")
        private Double distanceKm;

        public Long getServiceCategoryId() { return serviceCategoryId; }
        public void setServiceCategoryId(Long serviceCategoryId) { this.serviceCategoryId = serviceCategoryId; }
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    }

    public static class PriceEstimateResponse {
        private Long serviceCategoryId;
        private String serviceName;
        private Double distanceKm;
        private BigDecimal baseFee;
        private BigDecimal ratePerKm;
        private BigDecimal distanceCost;
        private BigDecimal additionalCharges;
        private BigDecimal estimatedPrice;
        private String formulaExplanation;
        private String disclaimer;

        public Long getServiceCategoryId() { return serviceCategoryId; }
        public void setServiceCategoryId(Long serviceCategoryId) { this.serviceCategoryId = serviceCategoryId; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
        public BigDecimal getBaseFee() { return baseFee; }
        public void setBaseFee(BigDecimal baseFee) { this.baseFee = baseFee; }
        public BigDecimal getRatePerKm() { return ratePerKm; }
        public void setRatePerKm(BigDecimal ratePerKm) { this.ratePerKm = ratePerKm; }
        public BigDecimal getDistanceCost() { return distanceCost; }
        public void setDistanceCost(BigDecimal distanceCost) { this.distanceCost = distanceCost; }
        public BigDecimal getAdditionalCharges() { return additionalCharges; }
        public void setAdditionalCharges(BigDecimal additionalCharges) { this.additionalCharges = additionalCharges; }
        public BigDecimal getEstimatedPrice() { return estimatedPrice; }
        public void setEstimatedPrice(BigDecimal estimatedPrice) { this.estimatedPrice = estimatedPrice; }
        public String getFormulaExplanation() { return formulaExplanation; }
        public void setFormulaExplanation(String formulaExplanation) { this.formulaExplanation = formulaExplanation; }
        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }

    public static class AiAnalyzeResponse {
        private boolean mockClassifier = true;
        private String classifierType = "SIMULATED_HEURISTIC_VISION_CLASSIFIER";
        private String suggestedBreakdownType;
        private String suggestedServiceCode;
        private String suggestedServiceName;
        private Long suggestedServiceCategoryId;
        private String confidenceLabel;
        private String analysisReasoning;
        private String diagnosticDisclaimer;
        private String uploadedPhotoUrl;

        public boolean isMockClassifier() { return mockClassifier; }
        public void setMockClassifier(boolean mockClassifier) { this.mockClassifier = mockClassifier; }
        public String getClassifierType() { return classifierType; }
        public void setClassifierType(String classifierType) { this.classifierType = classifierType; }
        public String getSuggestedBreakdownType() { return suggestedBreakdownType; }
        public void setSuggestedBreakdownType(String suggestedBreakdownType) { this.suggestedBreakdownType = suggestedBreakdownType; }
        public String getSuggestedServiceCode() { return suggestedServiceCode; }
        public void setSuggestedServiceCode(String suggestedServiceCode) { this.suggestedServiceCode = suggestedServiceCode; }
        public String getSuggestedServiceName() { return suggestedServiceName; }
        public void setSuggestedServiceName(String suggestedServiceName) { this.suggestedServiceName = suggestedServiceName; }
        public Long getSuggestedServiceCategoryId() { return suggestedServiceCategoryId; }
        public void setSuggestedServiceCategoryId(Long suggestedServiceCategoryId) { this.suggestedServiceCategoryId = suggestedServiceCategoryId; }
        public String getConfidenceLabel() { return confidenceLabel; }
        public void setConfidenceLabel(String confidenceLabel) { this.confidenceLabel = confidenceLabel; }
        public String getAnalysisReasoning() { return analysisReasoning; }
        public void setAnalysisReasoning(String analysisReasoning) { this.analysisReasoning = analysisReasoning; }
        public String getDiagnosticDisclaimer() { return diagnosticDisclaimer; }
        public void setDiagnosticDisclaimer(String diagnosticDisclaimer) { this.diagnosticDisclaimer = diagnosticDisclaimer; }
        public String getUploadedPhotoUrl() { return uploadedPhotoUrl; }
        public void setUploadedPhotoUrl(String uploadedPhotoUrl) { this.uploadedPhotoUrl = uploadedPhotoUrl; }
    }
}
