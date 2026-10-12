package com.autorescue.controller;

import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Roadside assistance booking creation, tracking, cancellation, payments, invoices, and reviews")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create and persist a new roadside assistance booking in PostgreSQL")
    public ResponseEntity<BookingDtos.BookingResponse> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingDtos.CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(authentication.getName(), request));
    }

    @GetMapping
    @Operation(summary = "List bookings for the authenticated user")
    public ResponseEntity<List<BookingDtos.BookingResponse>> getBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complete details of a booking by ID (with ownership verification)")
    public ResponseEntity<BookingDtos.BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBookingById(id, authentication.getName()));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an eligible booking")
    public ResponseEntity<BookingDtos.BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody(required = false) BookingDtos.CancelBookingRequest request) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, authentication.getName(), request));
    }

    @PostMapping("/{id}/bids/{bidId}/accept")
    @Operation(summary = "Accept a provider's bid on a booking")
    public ResponseEntity<BookingDtos.BookingResponse> acceptBid(
            @PathVariable Long id,
            @PathVariable Long bidId,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.acceptBidByCustomer(id, bidId, authentication.getName()));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Process payment (or clearly labelled mock payment) and generate tax invoice")
    public ResponseEntity<BookingDtos.BookingResponse> payForBooking(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody PaymentReviewDtos.ProcessPaymentRequest request) {
        request.setBookingId(id);
        return ResponseEntity.ok(bookingService.processPayment(authentication.getName(), request));
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Submit customer rating and review for a completed booking")
    public ResponseEntity<PaymentReviewDtos.ReviewDto> submitReview(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody PaymentReviewDtos.SubmitReviewRequest request) {
        request.setBookingId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.submitReview(authentication.getName(), request));
    }

    @PostMapping("/{id}/dispute")
    @Operation(summary = "Submit a complaint or dispute on a booking")
    public ResponseEntity<BookingDtos.BookingResponse> raiseDispute(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody BookingDtos.DisputeRequest request) {
        return ResponseEntity.ok(bookingService.raiseDispute(id, authentication.getName(), request));
    }
}
