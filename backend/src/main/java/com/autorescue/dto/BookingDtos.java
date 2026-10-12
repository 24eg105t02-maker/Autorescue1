package com.autorescue.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BookingDtos {

    public static class CreateBookingRequest {
        @NotNull(message = "Service category ID is required")
        private Long serviceCategoryId;

        @NotBlank(message = "Vehicle make is required")
        private String vehicleMake;

        @NotBlank(message = "Vehicle model is required")
        private String vehicleModel;

        private String vehicleYear;

        @NotBlank(message = "Vehicle registration number is required")
        private String vehicleRegistration;

        @NotBlank(message = "Vehicle type is required")
        private String vehicleType;

        @NotBlank(message = "Breakdown type is required")
        private String breakdownType;

        @NotBlank(message = "Problem description is required")
        private String problemDescription;

        private String aiSuggestedCategory;
        private String aiConfidenceNote;

        @NotBlank(message = "Pickup address is required")
        private String pickupAddress;

        private String destinationAddress;
        private Double pickupLatitude = 12.9716;
        private Double pickupLongitude = 77.5946;

        @NotNull(message = "Estimated distance is required")
        @DecimalMin(value = "0.5", message = "Distance must be at least 0.5 km")
        private Double distanceKm = 5.0;

        private List<String> photoUrls = new ArrayList<>();

        public Long getServiceCategoryId() { return serviceCategoryId; }
        public void setServiceCategoryId(Long serviceCategoryId) { this.serviceCategoryId = serviceCategoryId; }
        public String getVehicleMake() { return vehicleMake; }
        public void setVehicleMake(String vehicleMake) { this.vehicleMake = vehicleMake; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public String getVehicleYear() { return vehicleYear; }
        public void setVehicleYear(String vehicleYear) { this.vehicleYear = vehicleYear; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getBreakdownType() { return breakdownType; }
        public void setBreakdownType(String breakdownType) { this.breakdownType = breakdownType; }
        public String getProblemDescription() { return problemDescription; }
        public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }
        public String getAiSuggestedCategory() { return aiSuggestedCategory; }
        public void setAiSuggestedCategory(String aiSuggestedCategory) { this.aiSuggestedCategory = aiSuggestedCategory; }
        public String getAiConfidenceNote() { return aiConfidenceNote; }
        public void setAiConfidenceNote(String aiConfidenceNote) { this.aiConfidenceNote = aiConfidenceNote; }
        public String getPickupAddress() { return pickupAddress; }
        public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
        public String getDestinationAddress() { return destinationAddress; }
        public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
        public Double getPickupLatitude() { return pickupLatitude; }
        public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
        public Double getPickupLongitude() { return pickupLongitude; }
        public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
        public List<String> getPhotoUrls() { return photoUrls; }
        public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
    }

    public static class CancelBookingRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class SubmitBidRequest {
        @NotNull(message = "Quoted price is required")
        @DecimalMin(value = "100.0", message = "Quoted price must be at least 100")
        private BigDecimal quotedPrice;

        @NotNull(message = "Estimated arrival time is required")
        @Min(value = 5, message = "Estimated arrival time must be at least 5 minutes")
        private Integer estimatedArrivalMinutes;

        private String notes;

        public BigDecimal getQuotedPrice() { return quotedPrice; }
        public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }
        public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
        public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateJobStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;
        private Integer estimatedArrivalMinutes;
        private BigDecimal finalPrice;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
        public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }
        public BigDecimal getFinalPrice() { return finalPrice; }
        public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }
    }

    public static class DisputeRequest {
        @NotBlank(message = "Dispute reason is required")
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class BookingPhotoDto {
        private Long id;
        private String fileUrl;
        private String fileName;
        private String aiAnalysisLabel;
        private String uploadedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getAiAnalysisLabel() { return aiAnalysisLabel; }
        public void setAiAnalysisLabel(String aiAnalysisLabel) { this.aiAnalysisLabel = aiAnalysisLabel; }
        public String getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }
    }

    public static class BidDto {
        private Long id;
        private Long bookingId;
        private Long providerProfileId;
        private String providerBusinessName;
        private String providerPhone;
        private Double providerRating;
        private BigDecimal quotedPrice;
        private Integer estimatedArrivalMinutes;
        private String notes;
        private String status;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public Long getProviderProfileId() { return providerProfileId; }
        public void setProviderProfileId(Long providerProfileId) { this.providerProfileId = providerProfileId; }
        public String getProviderBusinessName() { return providerBusinessName; }
        public void setProviderBusinessName(String providerBusinessName) { this.providerBusinessName = providerBusinessName; }
        public String getProviderPhone() { return providerPhone; }
        public void setProviderPhone(String providerPhone) { this.providerPhone = providerPhone; }
        public Double getProviderRating() { return providerRating; }
        public void setProviderRating(Double providerRating) { this.providerRating = providerRating; }
        public BigDecimal getQuotedPrice() { return quotedPrice; }
        public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }
        public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
        public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class BookingResponse {
        private Long id;
        private String bookingCode;
        private Long customerId;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private Long assignedProviderId;
        private String assignedProviderBusinessName;
        private String assignedProviderPhone;
        private Double assignedProviderRating;
        private Double assignedProviderLat;
        private Double assignedProviderLng;
        private Long serviceCategoryId;
        private String serviceCategoryName;
        private String serviceCategoryCode;
        private String vehicleMake;
        private String vehicleModel;
        private String vehicleYear;
        private String vehicleRegistration;
        private String vehicleType;
        private String breakdownType;
        private String problemDescription;
        private String aiSuggestedCategory;
        private String aiConfidenceNote;
        private String pickupAddress;
        private String destinationAddress;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double distanceKm;
        private BigDecimal baseFee;
        private BigDecimal ratePerKm;
        private BigDecimal additionalCharges;
        private BigDecimal estimatedPrice;
        private BigDecimal finalPrice;
        private String status;
        private String paymentStatus;
        private String cancellationReason;
        private Integer estimatedArrivalMinutes;
        private String disputeStatus;
        private String disputeReason;
        private String disputeResolution;
        private String createdAt;
        private String updatedAt;
        private String completedAt;
        private List<BookingPhotoDto> photos = new ArrayList<>();
        private List<BidDto> bids = new ArrayList<>();
        private PaymentReviewDtos.PaymentDto payment;
        private PaymentReviewDtos.InvoiceDto invoice;
        private PaymentReviewDtos.ReviewDto review;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBookingCode() { return bookingCode; }
        public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public Long getAssignedProviderId() { return assignedProviderId; }
        public void setAssignedProviderId(Long assignedProviderId) { this.assignedProviderId = assignedProviderId; }
        public String getAssignedProviderBusinessName() { return assignedProviderBusinessName; }
        public void setAssignedProviderBusinessName(String assignedProviderBusinessName) { this.assignedProviderBusinessName = assignedProviderBusinessName; }
        public String getAssignedProviderPhone() { return assignedProviderPhone; }
        public void setAssignedProviderPhone(String assignedProviderPhone) { this.assignedProviderPhone = assignedProviderPhone; }
        public Double getAssignedProviderRating() { return assignedProviderRating; }
        public void setAssignedProviderRating(Double assignedProviderRating) { this.assignedProviderRating = assignedProviderRating; }
        public Double getAssignedProviderLat() { return assignedProviderLat; }
        public void setAssignedProviderLat(Double assignedProviderLat) { this.assignedProviderLat = assignedProviderLat; }
        public Double getAssignedProviderLng() { return assignedProviderLng; }
        public void setAssignedProviderLng(Double assignedProviderLng) { this.assignedProviderLng = assignedProviderLng; }
        public Long getServiceCategoryId() { return serviceCategoryId; }
        public void setServiceCategoryId(Long serviceCategoryId) { this.serviceCategoryId = serviceCategoryId; }
        public String getServiceCategoryName() { return serviceCategoryName; }
        public void setServiceCategoryName(String serviceCategoryName) { this.serviceCategoryName = serviceCategoryName; }
        public String getServiceCategoryCode() { return serviceCategoryCode; }
        public void setServiceCategoryCode(String serviceCategoryCode) { this.serviceCategoryCode = serviceCategoryCode; }
        public String getVehicleMake() { return vehicleMake; }
        public void setVehicleMake(String vehicleMake) { this.vehicleMake = vehicleMake; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public String getVehicleYear() { return vehicleYear; }
        public void setVehicleYear(String vehicleYear) { this.vehicleYear = vehicleYear; }
        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getBreakdownType() { return breakdownType; }
        public void setBreakdownType(String breakdownType) { this.breakdownType = breakdownType; }
        public String getProblemDescription() { return problemDescription; }
        public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }
        public String getAiSuggestedCategory() { return aiSuggestedCategory; }
        public void setAiSuggestedCategory(String aiSuggestedCategory) { this.aiSuggestedCategory = aiSuggestedCategory; }
        public String getAiConfidenceNote() { return aiConfidenceNote; }
        public void setAiConfidenceNote(String aiConfidenceNote) { this.aiConfidenceNote = aiConfidenceNote; }
        public String getPickupAddress() { return pickupAddress; }
        public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
        public String getDestinationAddress() { return destinationAddress; }
        public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
        public Double getPickupLatitude() { return pickupLatitude; }
        public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
        public Double getPickupLongitude() { return pickupLongitude; }
        public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
        public BigDecimal getBaseFee() { return baseFee; }
        public void setBaseFee(BigDecimal baseFee) { this.baseFee = baseFee; }
        public BigDecimal getRatePerKm() { return ratePerKm; }
        public void setRatePerKm(BigDecimal ratePerKm) { this.ratePerKm = ratePerKm; }
        public BigDecimal getAdditionalCharges() { return additionalCharges; }
        public void setAdditionalCharges(BigDecimal additionalCharges) { this.additionalCharges = additionalCharges; }
        public BigDecimal getEstimatedPrice() { return estimatedPrice; }
        public void setEstimatedPrice(BigDecimal estimatedPrice) { this.estimatedPrice = estimatedPrice; }
        public BigDecimal getFinalPrice() { return finalPrice; }
        public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
        public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
        public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }
        public String getDisputeStatus() { return disputeStatus; }
        public void setDisputeStatus(String disputeStatus) { this.disputeStatus = disputeStatus; }
        public String getDisputeReason() { return disputeReason; }
        public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
        public String getDisputeResolution() { return disputeResolution; }
        public void setDisputeResolution(String disputeResolution) { this.disputeResolution = disputeResolution; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
        public List<BookingPhotoDto> getPhotos() { return photos; }
        public void setPhotos(List<BookingPhotoDto> photos) { this.photos = photos; }
        public List<BidDto> getBids() { return bids; }
        public void setBids(List<BidDto> bids) { this.bids = bids; }
        public PaymentReviewDtos.PaymentDto getPayment() { return payment; }
        public void setPayment(PaymentReviewDtos.PaymentDto payment) { this.payment = payment; }
        public PaymentReviewDtos.InvoiceDto getInvoice() { return invoice; }
        public void setInvoice(PaymentReviewDtos.InvoiceDto invoice) { this.invoice = invoice; }
        public PaymentReviewDtos.ReviewDto getReview() { return review; }
        public void setReview(PaymentReviewDtos.ReviewDto review) { this.review = review; }
    }
}
