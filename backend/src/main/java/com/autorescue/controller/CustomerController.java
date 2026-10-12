package com.autorescue.controller;

import com.autorescue.dto.AuthDtos;
import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.CustomerDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.service.AuthService;
import com.autorescue.service.BookingService;
import com.autorescue.service.NotificationAuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Customer profile, bookings, payments, and notifications")
public class CustomerController {

    private final AuthService authService;
    private final BookingService bookingService;
    private final NotificationAuditService notificationAuditService;

    public CustomerController(
            AuthService authService,
            BookingService bookingService,
            NotificationAuditService notificationAuditService) {
        this.authService = authService;
        this.bookingService = bookingService;
        this.notificationAuditService = notificationAuditService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current customer profile and default vehicle details")
    public ResponseEntity<AuthDtos.UserSummaryDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(authentication.getName()));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current customer profile and default vehicle details")
    public ResponseEntity<AuthDtos.UserSummaryDto> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerDtos.UpdateCustomerProfileRequest request) {
        return ResponseEntity.ok(authService.updateCustomerProfile(authentication.getName(), request));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all bookings belonging to the authenticated customer")
    public ResponseEntity<List<BookingDtos.BookingResponse>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(authentication.getName()));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payment history for the authenticated customer")
    public ResponseEntity<List<PaymentReviewDtos.PaymentDto>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getCustomerPayments(authentication.getName()));
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get notifications for the authenticated user")
    public ResponseEntity<List<PaymentReviewDtos.NotificationDto>> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationAuditService.getUserNotifications(authentication.getName()));
    }

    @PatchMapping("/notifications/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllNotificationsRead(Authentication authentication) {
        notificationAuditService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PatchMapping("/notifications/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<Map<String, String>> markNotificationRead(
            Authentication authentication,
            @PathVariable Long id) {
        notificationAuditService.markRead(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
}
