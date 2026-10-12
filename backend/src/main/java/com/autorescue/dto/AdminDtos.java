package com.autorescue.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class AdminDtos {

    public static class ProviderVerificationRequest {
        @NotBlank(message = "Verification status is required (APPROVED, REJECTED, SUSPENDED, PENDING)")
        private String status;
        private String notes;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ResolveDisputeRequest {
        @NotBlank(message = "Dispute status is required (RESOLVED, REFUNDED, REJECTED)")
        private String disputeStatus;
        @NotBlank(message = "Resolution notes are required")
        private String resolution;

        public String getDisputeStatus() { return disputeStatus; }
        public void setDisputeStatus(String disputeStatus) { this.disputeStatus = disputeStatus; }
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
    }

    public static class AdminAnalyticsResponse {
        private long totalCustomers;
        private long totalProviders;
        private long pendingVerifications;
        private long approvedProviders;
        private long activeBookings;
        private long completedBookings;
        private long cancelledBookings;
        private long openDisputes;
        private BigDecimal totalRevenue;
        private Map<String, Long> bookingsByCategory = new HashMap<>();

        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
        public long getTotalProviders() { return totalProviders; }
        public void setTotalProviders(long totalProviders) { this.totalProviders = totalProviders; }
        public long getPendingVerifications() { return pendingVerifications; }
        public void setPendingVerifications(long pendingVerifications) { this.pendingVerifications = pendingVerifications; }
        public long getApprovedProviders() { return approvedProviders; }
        public void setApprovedProviders(long approvedProviders) { this.approvedProviders = approvedProviders; }
        public long getActiveBookings() { return activeBookings; }
        public void setActiveBookings(long activeBookings) { this.activeBookings = activeBookings; }
        public long getCompletedBookings() { return completedBookings; }
        public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }
        public long getCancelledBookings() { return cancelledBookings; }
        public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
        public long getOpenDisputes() { return openDisputes; }
        public void setOpenDisputes(long openDisputes) { this.openDisputes = openDisputes; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        public Map<String, Long> getBookingsByCategory() { return bookingsByCategory; }
        public void setBookingsByCategory(Map<String, Long> bookingsByCategory) { this.bookingsByCategory = bookingsByCategory; }
    }

    public static class AuditLogDto {
        private Long id;
        private String actorEmail;
        private String actorRole;
        private String action;
        private String entityType;
        private String entityId;
        private String details;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getActorEmail() { return actorEmail; }
        public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
        public String getActorRole() { return actorRole; }
        public void setActorRole(String actorRole) { this.actorRole = actorRole; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
