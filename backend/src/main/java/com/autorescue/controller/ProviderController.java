package com.autorescue.controller;

import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.dto.ProviderDtos;
import com.autorescue.service.BookingService;
import com.autorescue.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
@Tag(name = "Providers", description = "Provider registration, business profile, fleet vehicles, documents, jobs, and bids")
public class ProviderController {

    private final ProviderService providerService;
    private final BookingService bookingService;

    public ProviderController(ProviderService providerService, BookingService bookingService) {
        this.providerService = providerService;
        this.bookingService = bookingService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register or update provider business profile")
    public ResponseEntity<ProviderDtos.ProviderProfileResponse> registerProvider(
            Authentication authentication,
            @Valid @RequestBody ProviderDtos.ProviderRegistrationRequest request) {
        return ResponseEntity.ok(providerService.registerOrUpdateBusiness(authentication.getName(), request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get authenticated provider business profile, vehicles, documents, and earnings")
    public ResponseEntity<ProviderDtos.ProviderProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(providerService.getMyProfile(authentication.getName()));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Get available open requests and jobs assigned to this provider")
    public ResponseEntity<List<BookingDtos.BookingResponse>> getJobs(Authentication authentication) {
        return ResponseEntity.ok(providerService.getAvailableAndAssignedJobs(authentication.getName()));
    }

    @PatchMapping("/availability")
    @Operation(summary = "Update provider online availability and GPS coordinates")
    public ResponseEntity<ProviderDtos.ProviderProfileResponse> updateAvailability(
            Authentication authentication,
            @Valid @RequestBody ProviderDtos.AvailabilityRequest request) {
        return ResponseEntity.ok(providerService.updateAvailability(authentication.getName(), request));
    }

    @PostMapping("/jobs/{id}/accept")
    @Operation(summary = "Accept an available roadside assistance job (requires APPROVED status)")
    public ResponseEntity<BookingDtos.BookingResponse> acceptJob(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.acceptJobByProvider(id, authentication.getName()));
    }

    @PostMapping("/jobs/{id}/bids")
    @Operation(summary = "Submit a price quote and ETA bid on an open job")
    public ResponseEntity<BookingDtos.BidDto> submitBid(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody BookingDtos.SubmitBidRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.submitBidByProvider(id, authentication.getName(), request));
    }

    @PatchMapping("/jobs/{id}/status")
    @Operation(summary = "Update job status (ACCEPTED, EN_ROUTE, IN_PROGRESS, COMPLETED)")
    public ResponseEntity<BookingDtos.BookingResponse> updateJobStatus(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody BookingDtos.UpdateJobStatusRequest request) {
        return ResponseEntity.ok(bookingService.updateJobStatusByProvider(id, authentication.getName(), request));
    }

    @PostMapping("/vehicles")
    @Operation(summary = "Add a recovery/towing vehicle to provider fleet")
    public ResponseEntity<ProviderDtos.VehicleDto> addVehicle(
            Authentication authentication,
            @Valid @RequestBody ProviderDtos.AddVehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerService.addVehicle(authentication.getName(), request));
    }

    @DeleteMapping("/vehicles/{id}")
    @Operation(summary = "Remove a vehicle from provider fleet")
    public ResponseEntity<Map<String, String>> deleteVehicle(
            @PathVariable Long id,
            Authentication authentication) {
        providerService.deleteVehicle(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Vehicle removed from fleet"));
    }

    @PostMapping("/documents")
    @Operation(summary = "Submit a verification document for admin review")
    public ResponseEntity<ProviderDtos.DocumentDto> addDocument(
            Authentication authentication,
            @Valid @RequestBody ProviderDtos.AddDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerService.addDocument(authentication.getName(), request));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get customer reviews for the authenticated provider")
    public ResponseEntity<List<PaymentReviewDtos.ReviewDto>> getReviews(Authentication authentication) {
        return ResponseEntity.ok(providerService.getProviderReviews(authentication.getName()));
    }
}
