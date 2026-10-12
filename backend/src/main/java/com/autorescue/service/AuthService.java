package com.autorescue.service;

import com.autorescue.dto.AuthDtos;
import com.autorescue.dto.CustomerDtos;
import com.autorescue.entity.ProviderProfile;
import com.autorescue.entity.Role;
import com.autorescue.entity.User;
import com.autorescue.entity.VerificationStatus;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.UnauthorizedActionException;
import com.autorescue.repository.ProviderProfileRepository;
import com.autorescue.repository.UserRepository;
import com.autorescue.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final NotificationAuditService notificationAuditService;

    public AuthService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager,
            NotificationAuditService notificationAuditService) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.notificationAuditService = notificationAuditService;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        // Prevent privilege escalation: public registration only permits CUSTOMER or PROVIDER
        Role assignedRole = Role.CUSTOMER;
        if (request.getRole() != null) {
            String requestedRole = request.getRole().trim().toUpperCase();
            if ("ADMIN".equals(requestedRole)) {
                throw new UnauthorizedActionException("Cannot self-register with ADMIN role. Admin privileges are strictly verified on the server.");
            }
            if ("PROVIDER".equals(requestedRole)) {
                assignedRole = Role.PROVIDER;
            }
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);
        user.setActive(true);
        user.setAddress(request.getAddress());
        user.setDefaultVehicleMake(request.getDefaultVehicleMake());
        user.setDefaultVehicleModel(request.getDefaultVehicleModel());
        user.setDefaultVehicleRegistration(request.getDefaultVehicleRegistration());
        user.setDefaultVehicleType(request.getDefaultVehicleType() != null ? request.getDefaultVehicleType() : "Sedan");

        User savedUser = userRepository.save(user);

        if (assignedRole == Role.PROVIDER) {
            ProviderProfile profile = new ProviderProfile();
            profile.setUser(savedUser);
            profile.setBusinessName(request.getBusinessName() != null && !request.getBusinessName().isBlank()
                    ? request.getBusinessName().trim()
                    : savedUser.getFullName() + " Roadside Services");
            String lic = request.getLicenseNumber() != null && !request.getLicenseNumber().isBlank()
                    ? request.getLicenseNumber().trim()
                    : "LIC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            profile.setLicenseNumber(lic);
            profile.setServiceArea(request.getServiceArea() != null && !request.getServiceArea().isBlank()
                    ? request.getServiceArea().trim()
                    : "Metropolitan Highway Corridor");
            profile.setCity(request.getCity() != null && !request.getCity().isBlank()
                    ? request.getCity().trim()
                    : "Bengaluru");
            profile.setSupportedCategories(request.getSupportedCategories() != null && !request.getSupportedCategories().isBlank()
                    ? request.getSupportedCategories().trim()
                    : "Flatbed Towing, Breakdown Towing, Battery Jump-Start, Flat-Tyre Assistance");
            profile.setVerificationStatus(VerificationStatus.PENDING);
            profile.setAvailable(true);
            providerProfileRepository.save(profile);

            notificationAuditService.createNotification(
                    savedUser,
                    "Provider Registration Received",
                    "Welcome to AutoRescue! Your business profile (" + profile.getBusinessName() + ") is currently PENDING admin verification.",
                    "PROVIDER_VERIFICATION",
                    String.valueOf(profile.getId())
            );
        } else {
            notificationAuditService.createNotification(
                    savedUser,
                    "Welcome to AutoRescue",
                    "Your account is active. You can request 24/7 emergency roadside assistance anytime.",
                    "WELCOME",
                    String.valueOf(savedUser.getId())
            );
        }

        notificationAuditService.logAction(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                "USER_REGISTERED",
                "User",
                String.valueOf(savedUser.getId()),
                "Registered new user with role " + savedUser.getRole().name()
        );

        String token = jwtTokenProvider.generateToken(savedUser);
        return new AuthDtos.AuthResponse(token, notificationAuditService.toUserSummary(savedUser));
    }

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedActionException("Your account has been deactivated. Please contact support.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        notificationAuditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "USER_LOGIN",
                "User",
                String.valueOf(user.getId()),
                "User logged in successfully"
        );

        String token = jwtTokenProvider.generateToken(user);
        return new AuthDtos.AuthResponse(token, notificationAuditService.toUserSummary(user));
    }

    public void logout(String token) {
        jwtTokenProvider.revokeToken(token);
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserSummaryDto getCurrentUserProfile(String email) {
        User user = notificationAuditService.getUserByEmail(email);
        return notificationAuditService.toUserSummary(user);
    }

    @Transactional
    public AuthDtos.UserSummaryDto updateCustomerProfile(String email, CustomerDtos.UpdateCustomerProfileRequest request) {
        User user = notificationAuditService.getUserByEmail(email);
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getDefaultVehicleMake() != null) {
            user.setDefaultVehicleMake(request.getDefaultVehicleMake().trim());
        }
        if (request.getDefaultVehicleModel() != null) {
            user.setDefaultVehicleModel(request.getDefaultVehicleModel().trim());
        }
        if (request.getDefaultVehicleRegistration() != null) {
            user.setDefaultVehicleRegistration(request.getDefaultVehicleRegistration().trim().toUpperCase());
        }
        if (request.getDefaultVehicleType() != null) {
            user.setDefaultVehicleType(request.getDefaultVehicleType().trim());
        }
        User saved = userRepository.save(user);
        return notificationAuditService.toUserSummary(saved);
    }
}
