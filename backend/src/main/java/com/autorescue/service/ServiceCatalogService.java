package com.autorescue.service;

import com.autorescue.dto.ServiceDtos;
import com.autorescue.entity.PricingRule;
import com.autorescue.entity.ServiceCategory;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.ResourceNotFoundException;
import com.autorescue.repository.PricingRuleRepository;
import com.autorescue.repository.ServiceCategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ServiceCatalogService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"
    );

    private final ServiceCategoryRepository serviceCategoryRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final NotificationAuditService notificationAuditService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public ServiceCatalogService(
            ServiceCategoryRepository serviceCategoryRepository,
            PricingRuleRepository pricingRuleRepository,
            NotificationAuditService notificationAuditService) {
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.notificationAuditService = notificationAuditService;
    }

    @Transactional(readOnly = true)
    public List<ServiceDtos.ServiceCategoryDto> getAllActiveServices() {
        return serviceCategoryRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceDtos.ServiceCategoryDto> getAllServicesForAdmin() {
        return serviceCategoryRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceDtos.ServiceCategoryDto getServiceById(Long id) {
        ServiceCategory cat = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service category not found with id: " + id));
        return toDto(cat);
    }

    @Transactional(readOnly = true)
    public ServiceDtos.PriceEstimateResponse calculatePriceEstimate(Long serviceCategoryId, Double distanceKm) {
        ServiceCategory cat = serviceCategoryRepository.findById(serviceCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Service category not found with id: " + serviceCategoryId));

        double validDistance = (distanceKm == null || distanceKm < 0.5) ? 5.0 : distanceKm;
        BigDecimal baseFee = cat.getBaseFee();
        BigDecimal ratePerKm = cat.getRatePerKm();
        BigDecimal additionalCharges = cat.getAdditionalCharges() != null ? cat.getAdditionalCharges() : BigDecimal.ZERO;

        BigDecimal distanceCost = ratePerKm.multiply(BigDecimal.valueOf(validDistance)).setScale(2, RoundingMode.HALF_UP);
        // Formula: Estimated Price = Base Fee + (Distance × Rate Per Kilometre) + Additional Charges
        BigDecimal estimatedPrice = baseFee.add(distanceCost).add(additionalCharges).setScale(2, RoundingMode.HALF_UP);

        ServiceDtos.PriceEstimateResponse response = new ServiceDtos.PriceEstimateResponse();
        response.setServiceCategoryId(cat.getId());
        response.setServiceName(cat.getName());
        response.setDistanceKm(validDistance);
        response.setBaseFee(baseFee);
        response.setRatePerKm(ratePerKm);
        response.setDistanceCost(distanceCost);
        response.setAdditionalCharges(additionalCharges);
        response.setEstimatedPrice(estimatedPrice);
        response.setFormulaExplanation(String.format(
                "Estimated Price (₹%s) = Base Fee (₹%s) + [Distance (%s km) × Rate/km (₹%s) = ₹%s] + Additional Charges (₹%s)",
                estimatedPrice, baseFee, validDistance, ratePerKm, distanceCost, additionalCharges
        ));
        response.setDisclaimer("Demonstration Estimate Only: Final cost may vary based on actual towing distance, terrain complexity, or parts required.");
        return response;
    }

    @Transactional
    public ServiceDtos.ServiceCategoryDto createOrUpdateService(Long id, ServiceDtos.UpsertServiceCategoryRequest request, String adminEmail) {
        ServiceCategory cat;
        if (id != null) {
            cat = serviceCategoryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Service category not found with id: " + id));
        } else {
            cat = new ServiceCategory();
        }
        cat.setCode(request.getCode().trim().toUpperCase());
        cat.setName(request.getName().trim());
        cat.setDescription(request.getDescription().trim());
        cat.setSupportedVehicleTypes(request.getSupportedVehicleTypes().trim());
        cat.setBaseFee(request.getBaseFee());
        cat.setRatePerKm(request.getRatePerKm());
        cat.setAdditionalCharges(request.getAdditionalCharges());
        cat.setEstimatedEtaMinutes(request.getEstimatedEtaMinutes() != null ? request.getEstimatedEtaMinutes() : 25);
        cat.setActive(request.isActive());
        cat.setIconName(request.getIconName() != null ? request.getIconName() : "Truck");

        ServiceCategory saved = serviceCategoryRepository.save(cat);

        PricingRule rule = pricingRuleRepository.findByServiceCategoryId(saved.getId()).orElseGet(() -> {
            PricingRule r = new PricingRule();
            r.setServiceCategory(saved);
            r.setRuleName(saved.getName() + " Standard Tariff");
            return r;
        });
        rule.setBaseFee(saved.getBaseFee());
        rule.setRatePerKm(saved.getRatePerKm());
        rule.setAdditionalCharges(saved.getAdditionalCharges());
        pricingRuleRepository.save(rule);

        notificationAuditService.logAction(
                adminEmail,
                "ADMIN",
                id == null ? "CREATE_SERVICE_CATEGORY" : "UPDATE_SERVICE_CATEGORY",
                "ServiceCategory",
                String.valueOf(saved.getId()),
                "Updated service pricing & configuration for " + saved.getName()
        );

        return toDto(saved);
    }

    public String storeUploadedFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty file.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported file type. Allowed formats: JPEG, PNG, WEBP, PDF.");
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
        String cleanExtension = ".jpg";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            cleanExtension = originalFilename.substring(dotIndex).replaceAll("[^a-zA-Z0-9.]", "");
        }
        String savedFileName = UUID.randomUUID() + cleanExtension;
        try {
            Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(savedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + savedFileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store uploaded file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ServiceDtos.AiAnalyzeResponse analyzeBreakdownMock(MultipartFile file, String hintText, String vehicleType) {
        String photoUrl = null;
        String fileName = "";
        if (file != null && !file.isEmpty()) {
            photoUrl = storeUploadedFile(file);
            fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        }

        String combined = (fileName + " " + (hintText != null ? hintText.toLowerCase() : "") + " " + (vehicleType != null ? vehicleType.toLowerCase() : "")).trim();

        String suggestedCode = "BREAKDOWN_TOWING";
        String suggestedBreakdown = "Engine / Mechanical Breakdown";
        String reasoning = "Heuristic keyword and visual metadata check detected general mechanical stall patterns.";

        if (combined.contains("tyre") || combined.contains("tire") || combined.contains("puncture") || combined.contains("flat") || combined.contains("wheel")) {
            suggestedCode = "FLAT_TYRE_ASSISTANCE";
            suggestedBreakdown = "Flat Tyre / Puncture";
            reasoning = "Detected tyre/wheel issue indicators. Recommending on-site Flat-Tyre Assistance or spare wheel swap.";
        } else if (combined.contains("battery") || combined.contains("jump") || combined.contains("dead") || combined.contains("start") || combined.contains("crank")) {
            suggestedCode = "BATTERY_JUMP_START";
            suggestedBreakdown = "Dead Battery / Starter Issue";
            reasoning = "Detected electrical/battery discharge indicators. Recommending 12V/24V Battery Jump-Start.";
        } else if (combined.contains("fuel") || combined.contains("petrol") || combined.contains("diesel") || combined.contains("empty") || combined.contains("gas")) {
            suggestedCode = "EMERGENCY_FUEL_DELIVERY";
            suggestedBreakdown = "Out of Fuel";
            reasoning = "Detected fuel depletion indicators. Recommending Emergency Fuel Delivery.";
        } else if (combined.contains("ev") || combined.contains("electric") || combined.contains("charge") || combined.contains("tesla") || combined.contains("nexon ev")) {
            suggestedCode = "EV_ROADSIDE_ASSISTANCE";
            suggestedBreakdown = "EV High-Voltage / Range Depletion";
            reasoning = "Detected Electric Vehicle parameters. Recommending specialized EV Roadside Assistance.";
        } else if (combined.contains("accident") || combined.contains("crash") || combined.contains("collision") || combined.contains("dent") || combined.contains("bumper")) {
            suggestedCode = "ACCIDENT_RECOVERY";
            suggestedBreakdown = "Collision / Accident Damage";
            reasoning = "Detected impact/collision indicators. Recommending Accident Recovery with winch extraction.";
        } else if (combined.contains("bike") || combined.contains("scooter") || combined.contains("motorcycle") || combined.contains("two-wheeler") || combined.contains("2w")) {
            suggestedCode = "TWO_WHEELER_TOWING";
            suggestedBreakdown = "Two-Wheeler Immobilized";
            reasoning = "Detected two-wheeler vehicle class. Recommending dedicated Two-Wheeler Towing carrier.";
        } else if (combined.contains("truck") || combined.contains("bus") || combined.contains("heavy") || combined.contains("commercial")) {
            suggestedCode = "HEAVY_VEHICLE_RECOVERY";
            suggestedBreakdown = "Heavy Commercial Vehicle Breakdown";
            reasoning = "Detected heavy commercial vehicle parameters. Recommending Heavy Vehicle Recovery.";
        } else if (combined.contains("luxury") || combined.contains("awd") || combined.contains("transmission") || combined.contains("gearbox") || combined.contains("flatbed")) {
            suggestedCode = "FLATBED_TOWING";
            suggestedBreakdown = "Drivetrain / Immobilized Vehicle";
            reasoning = "Detected drivetrain/immobilized vehicle condition. Recommending zero-wear Flatbed Towing.";
        }

        final String codeLookup = suggestedCode;
        ServiceCategory matched = serviceCategoryRepository.findByCode(codeLookup)
                .orElseGet(() -> serviceCategoryRepository.findByActiveTrueOrderByIdAsc().getFirst());

        ServiceDtos.AiAnalyzeResponse res = new ServiceDtos.AiAnalyzeResponse();
        res.setMockClassifier(true);
        res.setClassifierType("MOCK_RULE_BASED_CLASSIFIER (Demonstration Mode)");
        res.setSuggestedBreakdownType(suggestedBreakdown);
        res.setSuggestedServiceCode(matched.getCode());
        res.setSuggestedServiceName(matched.getName());
        res.setSuggestedServiceCategoryId(matched.getId());
        res.setConfidenceLabel("Simulated Triage Suggestion (Customer Confirmation Required)");
        res.setAnalysisReasoning(reasoning);
        res.setDiagnosticDisclaimer("IMPORTANT NOTICE: This is a clearly labelled Mock AI Classifier for demonstration triage. A photograph cannot definitively diagnose internal mechanical, electrical, or structural vehicle faults. Please verify and confirm or override the suggested service category below.");
        res.setUploadedPhotoUrl(photoUrl);
        return res;
    }

    public ServiceDtos.ServiceCategoryDto toDto(ServiceCategory cat) {
        ServiceDtos.ServiceCategoryDto dto = new ServiceDtos.ServiceCategoryDto();
        dto.setId(cat.getId());
        dto.setCode(cat.getCode());
        dto.setName(cat.getName());
        dto.setDescription(cat.getDescription());
        dto.setSupportedVehicleTypes(cat.getSupportedVehicleTypes());
        dto.setBaseFee(cat.getBaseFee());
        dto.setRatePerKm(cat.getRatePerKm());
        dto.setAdditionalCharges(cat.getAdditionalCharges());
        dto.setEstimatedEtaMinutes(cat.getEstimatedEtaMinutes());
        dto.setActive(cat.isActive());
        dto.setIconName(cat.getIconName());
        return dto;
    }
}
