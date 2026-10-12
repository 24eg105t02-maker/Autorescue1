package com.autorescue.service;

import com.autorescue.dto.*;
import com.autorescue.entity.*;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.ResourceNotFoundException;
import com.autorescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderDocumentRepository providerDocumentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AuditLogRepository auditLogRepository;
    private final ProviderService providerService;
    private final BookingService bookingService;
    private final NotificationAuditService notificationAuditService;

    public AdminService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            ProviderDocumentRepository providerDocumentRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            AuditLogRepository auditLogRepository,
            ProviderService providerService,
            BookingService bookingService,
            NotificationAuditService notificationAuditService) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.providerDocumentRepository = providerDocumentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.auditLogRepository = auditLogRepository;
        this.providerService = providerService;
        this.bookingService = bookingService;
        this.notificationAuditService = notificationAuditService;
    }

    @Transactional(readOnly = true)
    public AdminDtos.AdminAnalyticsResponse getAnalytics() {
        AdminDtos.AdminAnalyticsResponse res = new AdminDtos.AdminAnalyticsResponse();
        res.setTotalCustomers(userRepository.countByRole(Role.CUSTOMER));
        res.setTotalProviders(providerProfileRepository.count());
        res.setPendingVerifications(providerProfileRepository.countByVerificationStatus(VerificationStatus.PENDING));
        res.setApprovedProviders(providerProfileRepository.countByVerificationStatus(VerificationStatus.APPROVED));

        res.setActiveBookings(bookingRepository.countByStatusIn(List.of(
                BookingStatus.PENDING, BookingStatus.BIDDING, BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS
        )));
        res.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        res.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));

        List<Booking> allBookings = bookingRepository.findAll();
        long openDisputes = allBookings.stream().filter(b -> "OPEN".equalsIgnoreCase(b.getDisputeStatus())).count();
        res.setOpenDisputes(openDisputes);

        BigDecimal revenue = paymentRepository.findAll().stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        res.setTotalRevenue(revenue);

        Map<String, Long> byCategory = new HashMap<>();
        for (Booking b : allBookings) {
            String catName = b.getServiceCategory() != null ? b.getServiceCategory().getName() : "Other";
            byCategory.put(catName, byCategory.getOrDefault(catName, 0L) + 1L);
        }
        res.setBookingsByCategory(byCategory);
        return res;
    }

    @Transactional(readOnly = true)
    public List<AuthDtos.UserSummaryDto> getAllCustomers() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER)
                .stream()
                .map(notificationAuditService::toUserSummary)
                .toList();
    }

    @Transactional
    public AuthDtos.UserSummaryDto toggleUserActive(Long userId, String adminEmail) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setActive(!u.isActive());
        User saved = userRepository.save(u);
        notificationAuditService.logAction(adminEmail, "ADMIN", "TOGGLE_USER_STATUS", "User", String.valueOf(saved.getId()), "Set active=" + saved.isActive());
        return notificationAuditService.toUserSummary(saved);
    }

    @Transactional(readOnly = true)
    public List<ProviderDtos.ProviderProfileResponse> getAllProviders() {
        return providerProfileRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(providerService::toProfileResponse)
                .toList();
    }

    @Transactional
    public ProviderDtos.ProviderProfileResponse updateProviderVerification(
            Long providerProfileId, AdminDtos.ProviderVerificationRequest request, String adminEmail) {
        ProviderProfile profile = providerProfileRepository.findById(providerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with id: " + providerProfileId));

        VerificationStatus newStatus;
        try {
            newStatus = VerificationStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid verification status: " + request.getStatus());
        }

        profile.setVerificationStatus(newStatus);
        profile.setVerificationNotes(request.getNotes());
        ProviderProfile saved = providerProfileRepository.save(profile);

        // Update associated documents status too
        List<ProviderDocument> docs = providerDocumentRepository.findByProviderProfileIdOrderByUploadedAtDesc(saved.getId());
        for (ProviderDocument doc : docs) {
            doc.setVerificationStatus(newStatus);
        }
        providerDocumentRepository.saveAll(docs);

        notificationAuditService.createNotification(
                saved.getUser(),
                "Provider Verification " + newStatus.name(),
                "Your provider profile (" + saved.getBusinessName() + ") verification status has been updated to " + newStatus.name()
                        + (request.getNotes() != null && !request.getNotes().isBlank() ? ". Note: " + request.getNotes() : "."),
                "PROVIDER_VERIFICATION",
                String.valueOf(saved.getId())
        );

        notificationAuditService.logAction(
                adminEmail,
                "ADMIN",
                "PROVIDER_VERIFICATION_" + newStatus.name(),
                "ProviderProfile",
                String.valueOf(saved.getId()),
                "Updated verification for " + saved.getBusinessName() + " to " + newStatus.name()
        );

        return providerService.toProfileResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDtos.BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(bookingService::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingDtos.BookingResponse resolveDispute(Long bookingId, AdminDtos.ResolveDisputeRequest request, String adminEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setDisputeStatus(request.getDisputeStatus().trim().toUpperCase());
        booking.setDisputeResolution(request.getResolution().trim());

        if ("REFUNDED".equalsIgnoreCase(request.getDisputeStatus())) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.findByBookingId(booking.getId()).ifPresent(p -> {
                p.setStatus("REFUNDED");
                paymentRepository.save(p);
            });
        }

        Booking saved = bookingRepository.save(booking);

        notificationAuditService.createNotification(
                saved.getCustomer(),
                "Dispute Update on " + saved.getBookingCode(),
                "Admin updated your dispute to " + saved.getDisputeStatus() + ": " + saved.getDisputeResolution(),
                "DISPUTE_RESOLVED",
                String.valueOf(saved.getId())
        );

        notificationAuditService.logAction(
                adminEmail,
                "ADMIN",
                "DISPUTE_" + saved.getDisputeStatus(),
                "Booking",
                saved.getBookingCode(),
                saved.getDisputeResolution()
        );

        return bookingService.toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentReviewDtos.PaymentDto> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(bookingService::toPaymentDto)
                .toList();
    }

    @Transactional
    public PaymentReviewDtos.PaymentDto refundPayment(Long paymentId, String adminEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus("REFUNDED");
        Payment saved = paymentRepository.save(payment);

        Booking booking = saved.getBooking();
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        bookingRepository.save(booking);

        notificationAuditService.createNotification(
                booking.getCustomer(),
                "Payment Refunded: ₹" + saved.getAmount(),
                "Your payment for booking " + booking.getBookingCode() + " (Ref: " + saved.getTransactionReference() + ") has been marked REFUNDED.",
                "PAYMENT_REFUNDED",
                String.valueOf(booking.getId())
        );

        notificationAuditService.logAction(
                adminEmail,
                "ADMIN",
                "PAYMENT_REFUNDED",
                "Payment",
                saved.getTransactionReference(),
                "Refunded ₹" + saved.getAmount() + " for booking " + booking.getBookingCode()
        );

        return bookingService.toPaymentDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.AuditLogDto> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(notificationAuditService::toAuditLogDto)
                .toList();
    }
}
