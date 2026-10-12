package com.autorescue.service;

import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.dto.ServiceDtos;
import com.autorescue.entity.*;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.ResourceNotFoundException;
import com.autorescue.exception.UnauthorizedActionException;
import com.autorescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingPhotoRepository bookingPhotoRepository;
    private final ProviderBidRepository providerBidRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceCatalogService serviceCatalogService;
    private final NotificationAuditService notificationAuditService;

    public BookingService(
            BookingRepository bookingRepository,
            BookingPhotoRepository bookingPhotoRepository,
            ProviderBidRepository providerBidRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            ProviderProfileRepository providerProfileRepository,
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            ReviewRepository reviewRepository,
            ServiceCatalogService serviceCatalogService,
            NotificationAuditService notificationAuditService) {
        this.bookingRepository = bookingRepository;
        this.bookingPhotoRepository = bookingPhotoRepository;
        this.providerBidRepository = providerBidRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.reviewRepository = reviewRepository;
        this.serviceCatalogService = serviceCatalogService;
        this.notificationAuditService = notificationAuditService;
    }

    @Transactional
    public BookingDtos.BookingResponse createBooking(String customerEmail, BookingDtos.CreateBookingRequest request) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        ServiceCategory category = serviceCategoryRepository.findById(request.getServiceCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Service category not found"));

        ServiceDtos.PriceEstimateResponse estimate = serviceCatalogService.calculatePriceEstimate(
                category.getId(), request.getDistanceKm());

        String uniqueCode = "AR-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Booking booking = new Booking();
        booking.setBookingCode(uniqueCode);
        booking.setCustomer(customer);
        booking.setServiceCategory(category);
        booking.setVehicleMake(request.getVehicleMake().trim());
        booking.setVehicleModel(request.getVehicleModel().trim());
        booking.setVehicleYear(request.getVehicleYear());
        booking.setVehicleRegistration(request.getVehicleRegistration().trim().toUpperCase());
        booking.setVehicleType(request.getVehicleType().trim());
        booking.setBreakdownType(request.getBreakdownType().trim());
        booking.setProblemDescription(request.getProblemDescription().trim());
        booking.setAiSuggestedCategory(request.getAiSuggestedCategory());
        booking.setAiConfidenceNote(request.getAiConfidenceNote());
        booking.setPickupAddress(request.getPickupAddress().trim());
        booking.setDestinationAddress(request.getDestinationAddress());
        booking.setPickupLatitude(request.getPickupLatitude() != null ? request.getPickupLatitude() : 12.9716);
        booking.setPickupLongitude(request.getPickupLongitude() != null ? request.getPickupLongitude() : 77.5946);
        booking.setDistanceKm(estimate.getDistanceKm());
        booking.setBaseFee(estimate.getBaseFee());
        booking.setRatePerKm(estimate.getRatePerKm());
        booking.setAdditionalCharges(estimate.getAdditionalCharges());
        booking.setEstimatedPrice(estimate.getEstimatedPrice());
        booking.setFinalPrice(estimate.getEstimatedPrice());
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setEstimatedArrivalMinutes(category.getEstimatedEtaMinutes());

        Booking saved = bookingRepository.save(booking);

        if (request.getPhotoUrls() != null) {
            for (String url : request.getPhotoUrls()) {
                if (url != null && !url.isBlank()) {
                    BookingPhoto photo = new BookingPhoto();
                    photo.setBooking(saved);
                    photo.setFileUrl(url.trim());
                    photo.setFileName(url.substring(url.lastIndexOf('/') + 1));
                    photo.setContentType("image/jpeg");
                    photo.setAiAnalysisLabel(request.getAiSuggestedCategory() != null ? request.getAiSuggestedCategory() : "Customer Uploaded Photo");
                    bookingPhotoRepository.save(photo);
                }
            }
        }

        notificationAuditService.createNotification(
                customer,
                "Booking Created: " + saved.getBookingCode(),
                "Your request for " + category.getName() + " at " + saved.getPickupAddress() + " has been broadcast to verified providers.",
                "BOOKING_CREATED",
                String.valueOf(saved.getId())
        );

        // Notify approved available providers
        List<ProviderProfile> approvedProviders = providerProfileRepository.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.APPROVED);
        for (ProviderProfile provider : approvedProviders) {
            if (provider.isAvailable()) {
                notificationAuditService.createNotification(
                        provider.getUser(),
                        "New Roadside Job Available: " + saved.getBookingCode(),
                        category.getName() + " needed at " + saved.getPickupAddress() + " (" + saved.getVehicleMake() + " " + saved.getVehicleModel() + ").",
                        "NEW_JOB",
                        String.valueOf(saved.getId())
                );
            }
        }

        notificationAuditService.logAction(
                customer.getEmail(),
                customer.getRole().name(),
                "BOOKING_CREATED",
                "Booking",
                saved.getBookingCode(),
                "Created booking for " + category.getName() + " | Est: ₹" + saved.getEstimatedPrice()
        );

        return toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDtos.BookingResponse> getBookingsForUser(String email) {
        User user = notificationAuditService.getUserByEmail(email);
        if (user.getRole() == Role.ADMIN) {
            return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toBookingResponse).toList();
        } else if (user.getRole() == Role.PROVIDER) {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
            return bookingRepository.findByAssignedProviderIdOrderByCreatedAtDesc(profile.getId())
                    .stream().map(this::toBookingResponse).toList();
        }
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingDtos.BookingResponse getBookingById(Long id, String email) {
        User user = notificationAuditService.getUserByEmail(email);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (user.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedActionException("You are not authorized to access this booking.");
        }
        if (user.getRole() == Role.PROVIDER) {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
            boolean isOpenJob = booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.BIDDING;
            boolean isAssignedToMe = booking.getAssignedProvider() != null && booking.getAssignedProvider().getId().equals(profile.getId());
            if (!isOpenJob && !isAssignedToMe) {
                throw new UnauthorizedActionException("This booking is assigned to another provider.");
            }
        }
        return toBookingResponse(booking);
    }

    @Transactional
    public BookingDtos.BookingResponse cancelBooking(Long id, String email, BookingDtos.CancelBookingRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (user.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedActionException("You can only cancel your own bookings.");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a booking that is already " + booking.getStatus());
        }
        if (booking.getStatus() == BookingStatus.IN_PROGRESS && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Cannot cancel a service that is already in progress. Please contact support.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : "Cancelled by " + user.getRole().name());

        Booking saved = bookingRepository.save(booking);

        notificationAuditService.createNotification(
                booking.getCustomer(),
                "Booking Cancelled: " + booking.getBookingCode(),
                "Booking " + booking.getBookingCode() + " has been cancelled. Reason: " + saved.getCancellationReason(),
                "BOOKING_CANCELLED",
                String.valueOf(saved.getId())
        );

        if (booking.getAssignedProvider() != null) {
            notificationAuditService.createNotification(
                    booking.getAssignedProvider().getUser(),
                    "Assigned Job Cancelled: " + booking.getBookingCode(),
                    "Customer cancelled booking " + booking.getBookingCode() + ".",
                    "JOB_CANCELLED",
                    String.valueOf(saved.getId())
            );
        }

        notificationAuditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "BOOKING_CANCELLED",
                "Booking",
                saved.getBookingCode(),
                "Cancelled booking: " + saved.getCancellationReason()
        );

        return toBookingResponse(saved);
    }

    @Transactional
    public BookingDtos.BookingResponse acceptJobByProvider(Long bookingId, String providerEmail) {
        User user = notificationAuditService.getUserByEmail(providerEmail);
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (provider.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new UnauthorizedActionException("Only APPROVED providers may accept roadside assistance jobs. Current status: " + provider.getVerificationStatus());
        }
        if (!provider.isAvailable()) {
            throw new BadRequestException("Your availability is currently set to OFFLINE. Enable availability to accept jobs.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getAssignedProvider() != null || (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.BIDDING)) {
            throw new BadRequestException("This job has already been assigned or is no longer available.");
        }

        booking.setAssignedProvider(provider);
        booking.setStatus(BookingStatus.ACCEPTED);
        if (booking.getFinalPrice() == null) {
            booking.setFinalPrice(booking.getEstimatedPrice());
        }
        Booking saved = bookingRepository.save(booking);

        notificationAuditService.createNotification(
                booking.getCustomer(),
                "Provider Assigned: " + provider.getBusinessName(),
                provider.getBusinessName() + " has accepted your booking (" + booking.getBookingCode() + "). Estimated arrival: " + booking.getEstimatedArrivalMinutes() + " mins.",
                "PROVIDER_ASSIGNED",
                String.valueOf(saved.getId())
        );

        notificationAuditService.logAction(
                user.getEmail(),
                "PROVIDER",
                "JOB_ACCEPTED",
                "Booking",
                saved.getBookingCode(),
                "Provider " + provider.getBusinessName() + " accepted booking"
        );

        return toBookingResponse(saved);
    }

    @Transactional
    public BookingDtos.BidDto submitBidByProvider(Long bookingId, String providerEmail, BookingDtos.SubmitBidRequest request) {
        User user = notificationAuditService.getUserByEmail(providerEmail);
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (provider.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new UnauthorizedActionException("Only APPROVED providers can submit bids on jobs. Current status: " + provider.getVerificationStatus());
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.BIDDING) {
            throw new BadRequestException("Bidding is closed for this booking.");
        }

        ProviderBid bid = new ProviderBid();
        bid.setBooking(booking);
        bid.setProviderProfile(provider);
        bid.setQuotedPrice(request.getQuotedPrice());
        bid.setEstimatedArrivalMinutes(request.getEstimatedArrivalMinutes());
        bid.setNotes(request.getNotes());
        bid.setStatus("PENDING");

        ProviderBid savedBid = providerBidRepository.save(bid);

        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.BIDDING);
            bookingRepository.save(booking);
        }

        notificationAuditService.createNotification(
                booking.getCustomer(),
                "New Provider Bid on " + booking.getBookingCode(),
                provider.getBusinessName() + " quoted ₹" + request.getQuotedPrice() + " (ETA: " + request.getEstimatedArrivalMinutes() + " mins).",
                "NEW_BID",
                String.valueOf(booking.getId())
        );

        return toBidDto(savedBid);
    }

    @Transactional
    public BookingDtos.BookingResponse acceptBidByCustomer(Long bookingId, Long bidId, String customerEmail) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedActionException("You can only accept bids for your own booking.");
        }
        if (booking.getAssignedProvider() != null) {
            throw new BadRequestException("A provider is already assigned to this booking.");
        }

        ProviderBid bid = providerBidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found"));

        if (!bid.getBooking().getId().equals(booking.getId())) {
            throw new BadRequestException("Bid does not belong to this booking.");
        }

        bid.setStatus("ACCEPTED");
        providerBidRepository.save(bid);

        booking.setAssignedProvider(bid.getProviderProfile());
        booking.setFinalPrice(bid.getQuotedPrice());
        booking.setEstimatedArrivalMinutes(bid.getEstimatedArrivalMinutes());
        booking.setStatus(BookingStatus.ACCEPTED);
        Booking saved = bookingRepository.save(booking);

        notificationAuditService.createNotification(
                bid.getProviderProfile().getUser(),
                "Your Bid Was Accepted: " + booking.getBookingCode(),
                "Customer accepted your bid of ₹" + bid.getQuotedPrice() + " for booking " + booking.getBookingCode() + ".",
                "BID_ACCEPTED",
                String.valueOf(saved.getId())
        );

        return toBookingResponse(saved);
    }

    @Transactional
    public BookingDtos.BookingResponse updateJobStatusByProvider(Long bookingId, String actorEmail, BookingDtos.UpdateJobStatusRequest request) {
        User user = notificationAuditService.getUserByEmail(actorEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (user.getRole() == Role.PROVIDER) {
            ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
            if (booking.getAssignedProvider() == null || !booking.getAssignedProvider().getId().equals(provider.getId())) {
                throw new UnauthorizedActionException("You are not the assigned provider for this job.");
            }
        }

        BookingStatus newStatus;
        try {
            newStatus = BookingStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid booking status: " + request.getStatus());
        }

        booking.setStatus(newStatus);
        if (request.getEstimatedArrivalMinutes() != null) {
            booking.setEstimatedArrivalMinutes(request.getEstimatedArrivalMinutes());
        }
        if (request.getFinalPrice() != null && request.getFinalPrice().compareTo(BigDecimal.ZERO) > 0) {
            booking.setFinalPrice(request.getFinalPrice());
        }

        if (newStatus == BookingStatus.COMPLETED && booking.getCompletedAt() == null) {
            booking.setCompletedAt(LocalDateTime.now());
            if (booking.getFinalPrice() == null) {
                booking.setFinalPrice(booking.getEstimatedPrice());
            }
            if (booking.getAssignedProvider() != null) {
                ProviderProfile p = booking.getAssignedProvider();
                p.setTotalCompletedJobs(p.getTotalCompletedJobs() + 1);
                providerProfileRepository.save(p);
            }
        }

        Booking saved = bookingRepository.save(booking);

        notificationAuditService.createNotification(
                booking.getCustomer(),
                "Booking Status Updated: " + newStatus.name(),
                "Your booking " + booking.getBookingCode() + " is now " + newStatus.name().replace('_', ' ') + ".",
                "STATUS_UPDATE",
                String.valueOf(saved.getId())
        );

        notificationAuditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "JOB_STATUS_" + newStatus.name(),
                "Booking",
                saved.getBookingCode(),
                "Updated booking status to " + newStatus.name()
        );

        return toBookingResponse(saved);
    }

    @Transactional
    public BookingDtos.BookingResponse processPayment(String customerEmail, PaymentReviewDtos.ProcessPaymentRequest request) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId()) && customer.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("You are only authorized to pay for your own booking.");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This booking has already been paid.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay for a cancelled booking.");
        }

        BigDecimal totalAmount = booking.getFinalPrice() != null ? booking.getFinalPrice() : booking.getEstimatedPrice();
        boolean isRazorpay = request.getRazorpayPaymentId() != null && !request.getRazorpayPaymentId().isBlank();

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElseGet(Payment::new);
        payment.setBooking(booking);
        payment.setTransactionReference("TXN-AR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentGateway(isRazorpay ? "RAZORPAY_TEST_MODE" : "MOCK_DEMONSTRATION_GATEWAY");
        payment.setRazorpayOrderId(request.getRazorpayOrderId());
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setAmount(totalAmount);
        payment.setStatus("SUCCESS");
        payment.setMockPayment(!isRazorpay);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        booking.setPaymentStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);

        // Update provider earnings
        if (booking.getAssignedProvider() != null) {
            ProviderProfile provider = booking.getAssignedProvider();
            provider.setTotalEarnings(provider.getTotalEarnings().add(totalAmount));
            providerProfileRepository.save(provider);

            notificationAuditService.createNotification(
                    provider.getUser(),
                    "Payment Received: ₹" + totalAmount,
                    "Payment completed for booking " + booking.getBookingCode() + " (Ref: " + savedPayment.getTransactionReference() + ").",
                    "PAYMENT_RECEIVED",
                    String.valueOf(booking.getId())
            );
        }

        // Generate Invoice
        BigDecimal subtotal = totalAmount.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal taxAmount = totalAmount.subtract(subtotal);

        Invoice invoice = invoiceRepository.findByBookingId(booking.getId()).orElseGet(Invoice::new);
        invoice.setInvoiceNumber("INV-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        invoice.setBooking(booking);
        invoice.setPayment(savedPayment);
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setIssuedToName(customer.getFullName());
        invoice.setIssuedToEmail(customer.getEmail());
        invoice.setProviderBusinessName(booking.getAssignedProvider() != null
                ? booking.getAssignedProvider().getBusinessName()
                : "AutoRescue Network Dispatch");
        invoice.setIssuedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        notificationAuditService.createNotification(
                customer,
                "Invoice Generated: " + invoice.getInvoiceNumber(),
                "Your payment of ₹" + totalAmount + " was processed (" + savedPayment.getPaymentGateway() + "). Invoice " + invoice.getInvoiceNumber() + " is ready.",
                "INVOICE_GENERATED",
                String.valueOf(booking.getId())
        );

        notificationAuditService.logAction(
                customer.getEmail(),
                customer.getRole().name(),
                "PAYMENT_PROCESSED",
                "Payment",
                savedPayment.getTransactionReference(),
                "Paid ₹" + totalAmount + " via " + savedPayment.getPaymentGateway() + " | Invoice: " + invoice.getInvoiceNumber()
        );

        return toBookingResponse(booking);
    }

    @Transactional
    public PaymentReviewDtos.ReviewDto submitReview(String customerEmail, PaymentReviewDtos.SubmitReviewRequest request) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedActionException("You can only review your own completed bookings.");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted after the service is marked COMPLETED.");
        }
        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new BadRequestException("You have already submitted a review for this booking.");
        }
        if (booking.getAssignedProvider() == null) {
            throw new BadRequestException("No provider was assigned to this booking.");
        }

        ProviderProfile provider = booking.getAssignedProvider();

        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(customer);
        review.setProviderProfile(provider);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        Review saved = reviewRepository.save(review);

        // Update provider rating average
        int prevReviews = provider.getTotalReviews() != null ? provider.getTotalReviews() : 0;
        double prevAvg = provider.getRatingAverage() != null ? provider.getRatingAverage() : 5.0;
        double newAvg = ((prevAvg * prevReviews) + request.getRating()) / (prevReviews + 1);
        provider.setTotalReviews(prevReviews + 1);
        provider.setRatingAverage(Math.round(newAvg * 10.0) / 10.0);
        providerProfileRepository.save(provider);

        notificationAuditService.createNotification(
                provider.getUser(),
                "New " + request.getRating() + "★ Customer Review",
                customer.getFullName() + " left a review on booking " + booking.getBookingCode() + ": \"" + saved.getComment() + "\"",
                "NEW_REVIEW",
                String.valueOf(booking.getId())
        );

        return toReviewDto(saved);
    }

    @Transactional
    public BookingDtos.BookingResponse raiseDispute(Long bookingId, String customerEmail, BookingDtos.DisputeRequest request) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedActionException("You can only raise a dispute for your own booking.");
        }

        booking.setDisputeStatus("OPEN");
        booking.setDisputeReason(request.getReason().trim());
        Booking saved = bookingRepository.save(booking);

        notificationAuditService.logAction(
                customer.getEmail(),
                customer.getRole().name(),
                "DISPUTE_RAISED",
                "Booking",
                saved.getBookingCode(),
                "Customer raised dispute: " + saved.getDisputeReason()
        );

        return toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentReviewDtos.PaymentDto> getCustomerPayments(String customerEmail) {
        User customer = notificationAuditService.getUserByEmail(customerEmail);
        return paymentRepository.findByBookingCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::toPaymentDto)
                .toList();
    }

    public BookingDtos.BookingResponse toBookingResponse(Booking b) {
        BookingDtos.BookingResponse dto = new BookingDtos.BookingResponse();
        dto.setId(b.getId());
        dto.setBookingCode(b.getBookingCode());
        if (b.getCustomer() != null) {
            dto.setCustomerId(b.getCustomer().getId());
            dto.setCustomerName(b.getCustomer().getFullName());
            dto.setCustomerEmail(b.getCustomer().getEmail());
            dto.setCustomerPhone(b.getCustomer().getPhone());
        }
        if (b.getAssignedProvider() != null) {
            dto.setAssignedProviderId(b.getAssignedProvider().getId());
            dto.setAssignedProviderBusinessName(b.getAssignedProvider().getBusinessName());
            dto.setAssignedProviderPhone(b.getAssignedProvider().getUser().getPhone());
            dto.setAssignedProviderRating(b.getAssignedProvider().getRatingAverage());
            dto.setAssignedProviderLat(b.getAssignedProvider().getLatitude());
            dto.setAssignedProviderLng(b.getAssignedProvider().getLongitude());
        }
        if (b.getServiceCategory() != null) {
            dto.setServiceCategoryId(b.getServiceCategory().getId());
            dto.setServiceCategoryName(b.getServiceCategory().getName());
            dto.setServiceCategoryCode(b.getServiceCategory().getCode());
        }
        dto.setVehicleMake(b.getVehicleMake());
        dto.setVehicleModel(b.getVehicleModel());
        dto.setVehicleYear(b.getVehicleYear());
        dto.setVehicleRegistration(b.getVehicleRegistration());
        dto.setVehicleType(b.getVehicleType());
        dto.setBreakdownType(b.getBreakdownType());
        dto.setProblemDescription(b.getProblemDescription());
        dto.setAiSuggestedCategory(b.getAiSuggestedCategory());
        dto.setAiConfidenceNote(b.getAiConfidenceNote());
        dto.setPickupAddress(b.getPickupAddress());
        dto.setDestinationAddress(b.getDestinationAddress());
        dto.setPickupLatitude(b.getPickupLatitude());
        dto.setPickupLongitude(b.getPickupLongitude());
        dto.setDistanceKm(b.getDistanceKm());
        dto.setBaseFee(b.getBaseFee());
        dto.setRatePerKm(b.getRatePerKm());
        dto.setAdditionalCharges(b.getAdditionalCharges());
        dto.setEstimatedPrice(b.getEstimatedPrice());
        dto.setFinalPrice(b.getFinalPrice());
        dto.setStatus(b.getStatus().name());
        dto.setPaymentStatus(b.getPaymentStatus().name());
        dto.setCancellationReason(b.getCancellationReason());
        dto.setEstimatedArrivalMinutes(b.getEstimatedArrivalMinutes());
        dto.setDisputeStatus(b.getDisputeStatus());
        dto.setDisputeReason(b.getDisputeReason());
        dto.setDisputeResolution(b.getDisputeResolution());
        dto.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        dto.setUpdatedAt(b.getUpdatedAt() != null ? b.getUpdatedAt().toString() : null);
        dto.setCompletedAt(b.getCompletedAt() != null ? b.getCompletedAt().toString() : null);

        List<BookingDtos.BookingPhotoDto> photos = bookingPhotoRepository.findByBookingIdOrderByUploadedAtDesc(b.getId())
                .stream()
                .map(p -> {
                    BookingDtos.BookingPhotoDto pd = new BookingDtos.BookingPhotoDto();
                    pd.setId(p.getId());
                    pd.setFileUrl(p.getFileUrl());
                    pd.setFileName(p.getFileName());
                    pd.setAiAnalysisLabel(p.getAiAnalysisLabel());
                    pd.setUploadedAt(p.getUploadedAt() != null ? p.getUploadedAt().toString() : null);
                    return pd;
                }).toList();
        dto.setPhotos(photos);

        List<BookingDtos.BidDto> bids = providerBidRepository.findByBookingIdOrderByCreatedAtDesc(b.getId())
                .stream()
                .map(this::toBidDto)
                .toList();
        dto.setBids(bids);

        paymentRepository.findByBookingId(b.getId()).ifPresent(p -> dto.setPayment(toPaymentDto(p)));
        invoiceRepository.findByBookingId(b.getId()).ifPresent(inv -> dto.setInvoice(toInvoiceDto(inv)));
        reviewRepository.findByBookingId(b.getId()).ifPresent(rev -> dto.setReview(toReviewDto(rev)));

        return dto;
    }

    public BookingDtos.BidDto toBidDto(ProviderBid bid) {
        BookingDtos.BidDto dto = new BookingDtos.BidDto();
        dto.setId(bid.getId());
        dto.setBookingId(bid.getBooking().getId());
        dto.setProviderProfileId(bid.getProviderProfile().getId());
        dto.setProviderBusinessName(bid.getProviderProfile().getBusinessName());
        dto.setProviderPhone(bid.getProviderProfile().getUser().getPhone());
        dto.setProviderRating(bid.getProviderProfile().getRatingAverage());
        dto.setQuotedPrice(bid.getQuotedPrice());
        dto.setEstimatedArrivalMinutes(bid.getEstimatedArrivalMinutes());
        dto.setNotes(bid.getNotes());
        dto.setStatus(bid.getStatus());
        dto.setCreatedAt(bid.getCreatedAt() != null ? bid.getCreatedAt().toString() : null);
        return dto;
    }

    public PaymentReviewDtos.PaymentDto toPaymentDto(Payment p) {
        PaymentReviewDtos.PaymentDto dto = new PaymentReviewDtos.PaymentDto();
        dto.setId(p.getId());
        dto.setBookingId(p.getBooking().getId());
        dto.setBookingCode(p.getBooking().getBookingCode());
        dto.setServiceCategoryName(p.getBooking().getServiceCategory().getName());
        dto.setTransactionReference(p.getTransactionReference());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setPaymentGateway(p.getPaymentGateway());
        dto.setAmount(p.getAmount());
        dto.setStatus(p.getStatus());
        dto.setMockPayment(p.isMockPayment());
        dto.setPaidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        invoiceRepository.findByBookingId(p.getBooking().getId())
                .ifPresent(inv -> dto.setInvoiceNumber(inv.getInvoiceNumber()));
        return dto;
    }

    public PaymentReviewDtos.InvoiceDto toInvoiceDto(Invoice inv) {
        PaymentReviewDtos.InvoiceDto dto = new PaymentReviewDtos.InvoiceDto();
        dto.setId(inv.getId());
        dto.setInvoiceNumber(inv.getInvoiceNumber());
        dto.setBookingId(inv.getBooking().getId());
        dto.setBookingCode(inv.getBooking().getBookingCode());
        dto.setServiceName(inv.getBooking().getServiceCategory().getName());
        dto.setVehicleDetails(inv.getBooking().getVehicleMake() + " " + inv.getBooking().getVehicleModel() + " (" + inv.getBooking().getVehicleRegistration() + ")");
        dto.setPickupAddress(inv.getBooking().getPickupAddress());
        dto.setSubtotal(inv.getSubtotal());
        dto.setTaxAmount(inv.getTaxAmount());
        dto.setTotalAmount(inv.getTotalAmount());
        dto.setIssuedToName(inv.getIssuedToName());
        dto.setIssuedToEmail(inv.getIssuedToEmail());
        dto.setProviderBusinessName(inv.getProviderBusinessName());
        dto.setTransactionReference(inv.getPayment().getTransactionReference());
        dto.setMockPayment(inv.getPayment().isMockPayment());
        dto.setIssuedAt(inv.getIssuedAt() != null ? inv.getIssuedAt().toString() : null);
        return dto;
    }

    public PaymentReviewDtos.ReviewDto toReviewDto(Review r) {
        PaymentReviewDtos.ReviewDto dto = new PaymentReviewDtos.ReviewDto();
        dto.setId(r.getId());
        dto.setBookingId(r.getBooking().getId());
        dto.setBookingCode(r.getBooking().getBookingCode());
        dto.setServiceCategoryName(r.getBooking().getServiceCategory().getName());
        dto.setCustomerName(r.getCustomer().getFullName());
        dto.setProviderBusinessName(r.getProviderProfile().getBusinessName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        return dto;
    }
}
