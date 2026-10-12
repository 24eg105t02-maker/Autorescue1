package com.autorescue;

import com.autorescue.dto.AuthDtos;
import com.autorescue.dto.BookingDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.dto.ServiceDtos;
import com.autorescue.entity.*;
import com.autorescue.exception.BadRequestException;
import com.autorescue.exception.UnauthorizedActionException;
import com.autorescue.repository.*;
import com.autorescue.security.JwtTokenProvider;
import com.autorescue.service.AuthService;
import com.autorescue.service.BookingService;
import com.autorescue.service.NotificationAuditService;
import com.autorescue.service.ServiceCatalogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutoRescueServiceTests {

    @Mock private UserRepository userRepository;
    @Mock private ProviderProfileRepository providerProfileRepository;
    @Mock private ServiceCategoryRepository serviceCategoryRepository;
    @Mock private PricingRuleRepository pricingRuleRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private BookingPhotoRepository bookingPhotoRepository;
    @Mock private ProviderBidRepository providerBidRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AuthenticationManager authenticationManager;

    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;
    private NotificationAuditService notificationAuditService;
    private AuthService authService;
    private ServiceCatalogService serviceCatalogService;
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider("AutoRescueSuperSecretJwtKeyForUnitTesting2026SecureKey256Bits", 86400000L);
        notificationAuditService = new NotificationAuditService(notificationRepository, auditLogRepository, userRepository);
        authService = new AuthService(userRepository, providerProfileRepository, passwordEncoder, jwtTokenProvider, authenticationManager, notificationAuditService);
        serviceCatalogService = new ServiceCatalogService(serviceCategoryRepository, pricingRuleRepository, notificationAuditService);
        bookingService = new BookingService(
                bookingRepository, bookingPhotoRepository, providerBidRepository,
                serviceCategoryRepository, providerProfileRepository, paymentRepository,
                invoiceRepository, reviewRepository, serviceCatalogService, notificationAuditService
        );
    }

    @Test
    void shouldCalculateEstimatedPriceUsingExactFormula() {
        ServiceCategory flatbed = new ServiceCategory();
        flatbed.setId(1L);
        flatbed.setCode("FLATBED_TOWING");
        flatbed.setName("Flatbed Towing");
        flatbed.setBaseFee(new BigDecimal("1200.00"));
        flatbed.setRatePerKm(new BigDecimal("45.00"));
        flatbed.setAdditionalCharges(new BigDecimal("150.00"));

        when(serviceCategoryRepository.findById(1L)).thenReturn(Optional.of(flatbed));

        // Formula: 1200 + (10 * 45) + 150 = 1800.00
        ServiceDtos.PriceEstimateResponse estimate = serviceCatalogService.calculatePriceEstimate(1L, 10.0);

        assertEquals(new BigDecimal("1800.00"), estimate.getEstimatedPrice());
        assertEquals(new BigDecimal("450.00"), estimate.getDistanceCost());
        assertTrue(estimate.getDisclaimer().contains("Demonstration Estimate"));
    }

    @Test
    void shouldPreventSelfRegistrationAsAdminRole() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setFullName("Attacker User");
        req.setEmail("hacker@example.com");
        req.setPhone("9999999999");
        req.setPassword("Secret123");
        req.setRole("ADMIN");

        when(userRepository.existsByEmailIgnoreCase("hacker@example.com")).thenReturn(false);

        assertThrows(UnauthorizedActionException.class, () -> authService.register(req));
    }

    @Test
    void shouldRegisterCustomerHashPasswordAndGenerateValidJwt() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setFullName("Priya Nair");
        req.setEmail("priya@example.com");
        req.setPhone("9876543210");
        req.setPassword("Customer@123");
        req.setRole("CUSTOMER");

        when(userRepository.existsByEmailIgnoreCase("priya@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });

        AuthDtos.AuthResponse res = authService.register(req);

        assertNotNull(res.getToken());
        assertTrue(jwtTokenProvider.validateToken(res.getToken()));
        assertEquals("priya@example.com", jwtTokenProvider.getEmailFromToken(res.getToken()));
        assertEquals("CUSTOMER", res.getUser().getRole());
    }

    @Test
    void shouldBlockUnapprovedProviderFromAcceptingJob() {
        User providerUser = new User();
        providerUser.setId(20L);
        providerUser.setEmail("unverified@autorescue.com");
        providerUser.setRole(Role.PROVIDER);

        ProviderProfile pendingProfile = new ProviderProfile();
        pendingProfile.setId(5L);
        pendingProfile.setUser(providerUser);
        pendingProfile.setVerificationStatus(VerificationStatus.PENDING);
        pendingProfile.setAvailable(true);

        when(userRepository.findByEmailIgnoreCase("unverified@autorescue.com")).thenReturn(Optional.of(providerUser));
        when(providerProfileRepository.findByUserId(20L)).thenReturn(Optional.of(pendingProfile));

        assertThrows(UnauthorizedActionException.class,
                () -> bookingService.acceptJobByProvider(100L, "unverified@autorescue.com"));
    }

    @Test
    void shouldCompleteFullBookingToPaymentAndInvoiceFlow() {
        User customer = new User();
        customer.setId(1L);
        customer.setFullName("Aarav Mehta");
        customer.setEmail("customer@autorescue.com");
        customer.setPhone("9845030003");
        customer.setRole(Role.CUSTOMER);

        User providerUser = new User();
        providerUser.setId(2L);
        providerUser.setFullName("Rajesh Sharma");
        providerUser.setEmail("provider@autorescue.com");
        providerUser.setPhone("9845020002");
        providerUser.setRole(Role.PROVIDER);

        ProviderProfile approvedProvider = new ProviderProfile();
        approvedProvider.setId(10L);
        approvedProvider.setUser(providerUser);
        approvedProvider.setBusinessName("Apex Highway Recovery");
        approvedProvider.setVerificationStatus(VerificationStatus.APPROVED);
        approvedProvider.setAvailable(true);
        approvedProvider.setTotalCompletedJobs(0);
        approvedProvider.setTotalEarnings(BigDecimal.ZERO);

        ServiceCategory cat = new ServiceCategory();
        cat.setId(1L);
        cat.setCode("BATTERY_JUMP_START");
        cat.setName("Battery Jump-Start");
        cat.setBaseFee(new BigDecimal("399.00"));
        cat.setRatePerKm(new BigDecimal("15.00"));
        cat.setAdditionalCharges(new BigDecimal("50.00"));
        cat.setEstimatedEtaMinutes(15);

        when(userRepository.findByEmailIgnoreCase("customer@autorescue.com")).thenReturn(Optional.of(customer));
        when(userRepository.findByEmailIgnoreCase("provider@autorescue.com")).thenReturn(Optional.of(providerUser));
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(approvedProvider));
        when(serviceCategoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(providerProfileRepository.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.APPROVED))
                .thenReturn(List.of(approvedProvider));

        Booking savedBookingHolder = new Booking();
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            if (b.getId() == null) b.setId(500L);
            savedBookingHolder.setId(b.getId());
            savedBookingHolder.setBookingCode(b.getBookingCode());
            savedBookingHolder.setCustomer(b.getCustomer());
            savedBookingHolder.setAssignedProvider(b.getAssignedProvider());
            savedBookingHolder.setServiceCategory(b.getServiceCategory());
            savedBookingHolder.setVehicleMake(b.getVehicleMake());
            savedBookingHolder.setVehicleModel(b.getVehicleModel());
            savedBookingHolder.setVehicleRegistration(b.getVehicleRegistration());
            savedBookingHolder.setVehicleType(b.getVehicleType());
            savedBookingHolder.setBreakdownType(b.getBreakdownType());
            savedBookingHolder.setProblemDescription(b.getProblemDescription());
            savedBookingHolder.setPickupAddress(b.getPickupAddress());
            savedBookingHolder.setDistanceKm(b.getDistanceKm());
            savedBookingHolder.setBaseFee(b.getBaseFee());
            savedBookingHolder.setRatePerKm(b.getRatePerKm());
            savedBookingHolder.setAdditionalCharges(b.getAdditionalCharges());
            savedBookingHolder.setEstimatedPrice(b.getEstimatedPrice());
            savedBookingHolder.setFinalPrice(b.getFinalPrice());
            savedBookingHolder.setStatus(b.getStatus());
            savedBookingHolder.setPaymentStatus(b.getPaymentStatus());
            return b;
        });
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(savedBookingHolder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            i.setId(1L);
            return i;
        });

        // 1. Customer creates booking
        BookingDtos.CreateBookingRequest createReq = new BookingDtos.CreateBookingRequest();
        createReq.setServiceCategoryId(1L);
        createReq.setVehicleMake("Hyundai");
        createReq.setVehicleModel("Creta");
        createReq.setVehicleRegistration("KA-03-NM-7821");
        createReq.setVehicleType("SUV");
        createReq.setBreakdownType("Dead Battery");
        createReq.setProblemDescription("Car does not crank");
        createReq.setPickupAddress("MG Road, Bengaluru");
        createReq.setDistanceKm(4.0);

        BookingDtos.BookingResponse created = bookingService.createBooking("customer@autorescue.com", createReq);
        assertEquals("PENDING", created.getStatus());
        assertEquals(new BigDecimal("509.00"), created.getEstimatedPrice());

        // 2. Approved Provider accepts job
        BookingDtos.BookingResponse accepted = bookingService.acceptJobByProvider(500L, "provider@autorescue.com");
        assertEquals("ACCEPTED", accepted.getStatus());
        assertEquals("Apex Highway Recovery", accepted.getAssignedProviderBusinessName());

        // 3. Duplicate acceptance attempt fails
        assertThrows(BadRequestException.class, () -> bookingService.acceptJobByProvider(500L, "provider@autorescue.com"));

        // 4. Provider marks job COMPLETED
        BookingDtos.UpdateJobStatusRequest statusReq = new BookingDtos.UpdateJobStatusRequest();
        statusReq.setStatus("COMPLETED");
        BookingDtos.BookingResponse completed = bookingService.updateJobStatusByProvider(500L, "provider@autorescue.com", statusReq);
        assertEquals("COMPLETED", completed.getStatus());
        assertEquals(1, approvedProvider.getTotalCompletedJobs());

        // 5. Customer processes mock payment & invoice
        PaymentReviewDtos.ProcessPaymentRequest payReq = new PaymentReviewDtos.ProcessPaymentRequest();
        payReq.setBookingId(500L);
        payReq.setPaymentMethod("UPI_MOCK");
        BookingDtos.BookingResponse paid = bookingService.processPayment("customer@autorescue.com", payReq);
        assertEquals("PAID", paid.getPaymentStatus());
        assertEquals(new BigDecimal("509.00"), approvedProvider.getTotalEarnings());
    }
}
