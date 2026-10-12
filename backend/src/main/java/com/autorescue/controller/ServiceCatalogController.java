package com.autorescue.controller;

import com.autorescue.dto.ServiceDtos;
import com.autorescue.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@Tag(name = "Roadside Services", description = "Roadside assistance service categories, price estimation, and mock AI photo analysis")
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceCatalogController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    @Operation(summary = "List all active roadside assistance service categories")
    public ResponseEntity<List<ServiceDtos.ServiceCategoryDto>> getAllServices() {
        return ResponseEntity.ok(serviceCatalogService.getAllActiveServices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details and pricing of a specific roadside service category")
    public ResponseEntity<ServiceDtos.ServiceCategoryDto> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCatalogService.getServiceById(id));
    }

    @PostMapping("/estimate")
    @Operation(summary = "Calculate estimated price using Base Fee + (Distance × Rate/Km) + Additional Charges")
    public ResponseEntity<ServiceDtos.PriceEstimateResponse> estimatePrice(
            @Valid @RequestBody ServiceDtos.PriceEstimateRequest request) {
        return ResponseEntity.ok(serviceCatalogService.calculatePriceEstimate(
                request.getServiceCategoryId(), request.getDistanceKm()));
    }

    @PostMapping(value = "/ai-analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyze breakdown photo and symptom description with clearly labelled Mock AI Classifier")
    public ResponseEntity<ServiceDtos.AiAnalyzeResponse> analyzeBreakdown(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "hintText", required = false) String hintText,
            @RequestParam(value = "vehicleType", required = false) String vehicleType) {
        return ResponseEntity.ok(serviceCatalogService.analyzeBreakdownMock(file, hintText, vehicleType));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a breakdown photo or verification document")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = serviceCatalogService.storeUploadedFile(file);
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }
}
