package com.autorescue.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PaymentReviewDtos {

    public static class ProcessPaymentRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod = "UPI_MOCK";

        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }

    public static class PaymentDto {
        private Long id;
        private Long bookingId;
        private String bookingCode;
        private String serviceCategoryName;
        private String transactionReference;
        private String paymentMethod;
        private String paymentGateway;
        private BigDecimal amount;
        private String status;
        private boolean mockPayment;
        private String paidAt;
        private String invoiceNumber;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getBookingCode() { return bookingCode; }
        public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
        public String getServiceCategoryName() { return serviceCategoryName; }
        public void setServiceCategoryName(String serviceCategoryName) { this.serviceCategoryName = serviceCategoryName; }
        public String getTransactionReference() { return transactionReference; }
        public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentGateway() { return paymentGateway; }
        public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isMockPayment() { return mockPayment; }
        public void setMockPayment(boolean mockPayment) { this.mockPayment = mockPayment; }
        public String getPaidAt() { return paidAt; }
        public void setPaidAt(String paidAt) { this.paidAt = paidAt; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    }

    public static class InvoiceDto {
        private Long id;
        private String invoiceNumber;
        private Long bookingId;
        private String bookingCode;
        private String serviceName;
        private String vehicleDetails;
        private String pickupAddress;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String issuedToName;
        private String issuedToEmail;
        private String providerBusinessName;
        private String transactionReference;
        private boolean mockPayment;
        private String issuedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getBookingCode() { return bookingCode; }
        public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getVehicleDetails() { return vehicleDetails; }
        public void setVehicleDetails(String vehicleDetails) { this.vehicleDetails = vehicleDetails; }
        public String getPickupAddress() { return pickupAddress; }
        public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getIssuedToName() { return issuedToName; }
        public void setIssuedToName(String issuedToName) { this.issuedToName = issuedToName; }
        public String getIssuedToEmail() { return issuedToEmail; }
        public void setIssuedToEmail(String issuedToEmail) { this.issuedToEmail = issuedToEmail; }
        public String getProviderBusinessName() { return providerBusinessName; }
        public void setProviderBusinessName(String providerBusinessName) { this.providerBusinessName = providerBusinessName; }
        public String getTransactionReference() { return transactionReference; }
        public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
        public boolean isMockPayment() { return mockPayment; }
        public void setMockPayment(boolean mockPayment) { this.mockPayment = mockPayment; }
        public String getIssuedAt() { return issuedAt; }
        public void setIssuedAt(String issuedAt) { this.issuedAt = issuedAt; }
    }

    public static class SubmitReviewRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        @NotBlank(message = "Review comment is required")
        private String comment;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ReviewDto {
        private Long id;
        private Long bookingId;
        private String bookingCode;
        private String serviceCategoryName;
        private String customerName;
        private String providerBusinessName;
        private Integer rating;
        private String comment;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getBookingCode() { return bookingCode; }
        public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
        public String getServiceCategoryName() { return serviceCategoryName; }
        public void setServiceCategoryName(String serviceCategoryName) { this.serviceCategoryName = serviceCategoryName; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getProviderBusinessName() { return providerBusinessName; }
        public void setProviderBusinessName(String providerBusinessName) { this.providerBusinessName = providerBusinessName; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class NotificationDto {
        private Long id;
        private String title;
        private String message;
        private String type;
        private String referenceId;
        private boolean read;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getReferenceId() { return referenceId; }
        public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
