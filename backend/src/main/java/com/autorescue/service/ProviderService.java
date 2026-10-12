package com.autorescue.service;

import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.dto.ProviderDtos;
import com.autorescue.entity.*;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.ResourceNotFoundException;
import com.autorescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProviderService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderVehicleRepository providerVehicleRepository;
    private final ProviderDocumentRepository providerDocumentRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final NotificationAuditService notificationAuditService;

    public ProviderService(
            ProviderProfileRepository providerProfileRepository,
            ProviderVehicleRepository providerVehicleRepository,
            ProviderDocumentRepository providerDocumentRepository,
            BookingRepository bookingRepository,
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            BookingService bookingService,
            NotificationAuditService notificationAuditService) {
        this.providerProfileRepository = providerProfileRepository;
        this.providerVehicleRepository = providerVehicleRepository;
        this.providerDocumentRepository = providerDocumentRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
        this.notificationAuditService = notificationAuditService;
    }

    @Transactional
    public ProviderDtos.ProviderProfileResponse registerOrUpdateBusiness(String email, ProviderDtos.ProviderRegistrationRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        if (user.getRole() == Role.CUSTOMER) {
            user.setRole(Role.PROVIDER);
            userRepository.save(user);
        }

        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            ProviderProfile p = new ProviderProfile();
            p.setUser(user);
            p.setVerificationStatus(VerificationStatus.PENDING);
            return p;
        });

        profile.setBusinessName(request.getBusinessName().trim());
        profile.setLicenseNumber(request.getLicenseNumber().trim());
        profile.setServiceArea(request.getServiceArea().trim());
        profile.setCity(request.getCity().trim());
        profile.setSupportedCategories(request.getSupportedCategories().trim());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());

        ProviderProfile saved = providerProfileRepository.save(profile);

        notificationAuditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "PROVIDER_PROFILE_UPDATED",
                "ProviderProfile",
                String.valueOf(saved.getId()),
                "Updated business profile: " + saved.getBusinessName()
        );

        return toProfileResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProviderDtos.ProviderProfileResponse getMyProfile(String email) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user: " + email));
        return toProfileResponse(profile);
    }

    @Transactional
    public ProviderDtos.ProviderProfileResponse updateAvailability(String email, ProviderDtos.AvailabilityRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        profile.setAvailable(Boolean.TRUE.equals(request.getAvailable()));
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());

        ProviderProfile saved = providerProfileRepository.save(profile);
        return toProfileResponse(saved);
    }

    @Transactional
    public ProviderDtos.VehicleDto addVehicle(String email, ProviderDtos.AddVehicleRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        ProviderVehicle v = new ProviderVehicle();
        v.setProviderProfile(profile);
        v.setVehicleType(request.getVehicleType().trim());
        v.setMakeModel(request.getMakeModel().trim());
        v.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        v.setCapacityTons(request.getCapacityTons() != null ? request.getCapacityTons() : 2.5);
        v.setEquipmentDetails(request.getEquipmentDetails());
        v.setActive(true);

        ProviderVehicle saved = providerVehicleRepository.save(v);
        return toVehicleDto(saved);
    }

    @Transactional
    public void deleteVehicle(String email, Long vehicleId) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        ProviderVehicle v = providerVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        if (!v.getProviderProfile().getId().equals(profile.getId())) {
            throw new BadRequestException("Cannot delete another provider's vehicle.");
        }
        providerVehicleRepository.delete(v);
    }

    @Transactional
    public ProviderDtos.DocumentDto addDocument(String email, ProviderDtos.AddDocumentRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        ProviderDocument doc = new ProviderDocument();
        doc.setProviderProfile(profile);
        doc.setDocumentType(request.getDocumentType().trim());
        doc.setDocumentNumber(request.getDocumentNumber().trim().toUpperCase());
        doc.setFileUrl(request.getFileUrl().trim());
        doc.setVerificationStatus(profile.getVerificationStatus());

        ProviderDocument saved = providerDocumentRepository.save(doc);
        return toDocumentDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDtos.BookingResponse> getAvailableAndAssignedJobs(String email) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        List<Booking> openBookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(BookingStatus.PENDING, BookingStatus.BIDDING));
        List<Booking> myAssigned = bookingRepository.findByAssignedProviderIdOrderByCreatedAtDesc(profile.getId());

        java.util.LinkedHashMap<Long, Booking> merged = new java.util.LinkedHashMap<>();
        for (Booking b : myAssigned) merged.put(b.getId(), b);
        for (Booking b : openBookings) merged.putIfAbsent(b.getId(), b);

        return merged.values().stream().map(bookingService::toBookingResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentReviewDtos.ReviewDto> getProviderReviews(String email) {
        User user = notificationAuditService.getUserByEmail(email);
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return reviewRepository.findByProviderProfileIdOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(bookingService::toReviewDto)
                .toList();
    }

    public ProviderDtos.ProviderProfileResponse toProfileResponse(ProviderProfile p) {
        ProviderDtos.ProviderProfileResponse dto = new ProviderDtos.ProviderProfileResponse();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setUserId(p.getUser().getId());
            dto.setOwnerName(p.getUser().getFullName());
            dto.setEmail(p.getUser().getEmail());
            dto.setPhone(p.getUser().getPhone());
        }
        dto.setBusinessName(p.getBusinessName());
        dto.setLicenseNumber(p.getLicenseNumber());
        dto.setServiceArea(p.getServiceArea());
        dto.setCity(p.getCity());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setVerificationStatus(p.getVerificationStatus().name());
        dto.setVerificationNotes(p.getVerificationNotes());
        dto.setAvailable(p.isAvailable());
        dto.setSupportedCategories(p.getSupportedCategories());
        dto.setRatingAverage(p.getRatingAverage());
        dto.setTotalReviews(p.getTotalReviews());
        dto.setTotalCompletedJobs(p.getTotalCompletedJobs());
        dto.setTotalEarnings(p.getTotalEarnings());
        dto.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

        List<ProviderDtos.VehicleDto> vehicles = providerVehicleRepository
                .findByProviderProfileIdOrderByCreatedAtDesc(p.getId())
                .stream()
                .map(this::toVehicleDto)
                .toList();
        dto.setVehicles(vehicles);

        List<ProviderDtos.DocumentDto> docs = providerDocumentRepository
                .findByProviderProfileIdOrderByUploadedAtDesc(p.getId())
                .stream()
                .map(this::toDocumentDto)
                .toList();
        dto.setDocuments(docs);

        return dto;
    }

    public ProviderDtos.VehicleDto toVehicleDto(ProviderVehicle v) {
        ProviderDtos.VehicleDto dto = new ProviderDtos.VehicleDto();
        dto.setId(v.getId());
        dto.setVehicleType(v.getVehicleType());
        dto.setMakeModel(v.getMakeModel());
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setCapacityTons(v.getCapacityTons());
        dto.setEquipmentDetails(v.getEquipmentDetails());
        dto.setActive(v.isActive());
        dto.setCreatedAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null);
        return dto;
    }

    public ProviderDtos.DocumentDto toDocumentDto(ProviderDocument d) {
        ProviderDtos.DocumentDto dto = new ProviderDtos.DocumentDto();
        dto.setId(d.getId());
        dto.setDocumentType(d.getDocumentType());
        dto.setDocumentNumber(d.getDocumentNumber());
        dto.setFileUrl(d.getFileUrl());
        dto.setVerificationStatus(d.getVerificationStatus().name());
        dto.setUploadedAt(d.getUploadedAt() != null ? d.getUploadedAt().toString() : null);
        return dto;
    }
}
