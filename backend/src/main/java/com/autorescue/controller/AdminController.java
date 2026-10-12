package com.autorescue.controller;

import com.autorescue.dto.*;
import com.autorescue.service.AdminService;
import com.autorescue.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Secured administrative APIs for analytics, customer/provider management, verifications, pricing, and disputes")
public class AdminController {

    private final AdminService adminService;
    private final ServiceCatalogService serviceCatalogService;

    public AdminController(AdminService adminService, ServiceCatalogService serviceCatalogService) {
        this.adminService = adminService;
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform KPI summary, booking metrics, and revenue analytics")
    public ResponseEntity<AdminDtos.AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/customers")
    @Operation(summary = "List all registered customers")
    public ResponseEntity<List<AuthDtos.UserSummaryDto>> getCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @PatchMapping("/customers/{id}/toggle-active")
    @Operation(summary = "Activate or suspend a customer account")
    public ResponseEntity<AuthDtos.UserSummaryDto> toggleCustomerActive(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(adminService.toggleUserActive(id, authentication.getName()));
    }

    @GetMapping("/providers")
    @Operation(summary = "List all service providers and verification documents")
    public ResponseEntity<List<ProviderDtos.ProviderProfileResponse>> getProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }

    @PatchMapping("/providers/{id}/verification")
    @Operation(summary = "Approve, reject, or suspend a service provider verification")
    public ResponseEntity<ProviderDtos.ProviderProfileResponse> updateProviderVerification(
            @PathVariable Long id,
            @Valid @RequestBody AdminDtos.ProviderVerificationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(adminService.updateProviderVerification(id, request, authentication.getName()));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings across the platform")
    public ResponseEntity<List<BookingDtos.BookingResponse>> getBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PatchMapping("/bookings/{id}/dispute")
    @Operation(summary = "Resolve a booking complaint/dispute or issue refund")
    public ResponseEntity<BookingDtos.BookingResponse> resolveDispute(
            @PathVariable Long id,
            @Valid @RequestBody AdminDtos.ResolveDisputeRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(adminService.resolveDispute(id, request, authentication.getName()));
    }

    @GetMapping("/services")
    @Operation(summary = "List all service categories (including inactive)")
    public ResponseEntity<List<ServiceDtos.ServiceCategoryDto>> getAllServices() {
        return ResponseEntity.ok(serviceCatalogService.getAllServicesForAdmin());
    }

    @PostMapping("/services")
    @Operation(summary = "Create a new roadside service category and pricing rule")
    public ResponseEntity<ServiceDtos.ServiceCategoryDto> createService(
            @Valid @RequestBody ServiceDtos.UpsertServiceCategoryRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceCatalogService.createOrUpdateService(null, request, authentication.getName()));
    }

    @PutMapping("/services/{id}")
    @Operation(summary = "Update an existing roadside service category and pricing rule")
    public ResponseEntity<ServiceDtos.ServiceCategoryDto> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceDtos.UpsertServiceCategoryRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(serviceCatalogService.createOrUpdateService(id, request, authentication.getName()));
    }

    @GetMapping("/payments")
    @Operation(summary = "List all platform payments and invoice references")
    public ResponseEntity<List<PaymentReviewDtos.PaymentDto>> getPayments() {
        return ResponseEntity.ok(adminService.getAllPayments());
    }

    @PostMapping("/payments/{id}/refund")
    @Operation(summary = "Mark a payment as refunded")
    public ResponseEntity<PaymentReviewDtos.PaymentDto> refundPayment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(adminService.refundPayment(id, authentication.getName()));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "View recent platform security and operational audit logs")
    public ResponseEntity<List<AdminDtos.AuditLogDto>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getRecentAuditLogs());
    }
}
