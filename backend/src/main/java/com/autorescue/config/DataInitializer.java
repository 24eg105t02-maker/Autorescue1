package com.autorescue.config;

import com.autorescue.entity.*;
import com.autorescue.repository.*;
import com.autorescue.service.NotificationAuditService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderVehicleRepository providerVehicleRepository;
    private final ProviderDocumentRepository providerDocumentRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationAuditService notificationAuditService;

    public DataInitializer(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            ProviderVehicleRepository providerVehicleRepository,
            ProviderDocumentRepository providerDocumentRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            NotificationAuditService notificationAuditService) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.providerVehicleRepository = providerVehicleRepository;
        this.providerDocumentRepository = providerDocumentRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationAuditService = notificationAuditService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Seed Admin User
        User admin = new User();
        admin.setFullName("Vikram Rathore (System Admin)");
        admin.setEmail("admin@autorescue.com");
        admin.setPhone("+91 98450 10001");
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setAddress("AutoRescue Command Center, MG Road, Bengaluru");
        admin = userRepository.save(admin);

        // 2. Seed Approved Provider User
        User providerUser1 = new User();
        providerUser1.setFullName("Rajesh Sharma");
        providerUser1.setEmail("provider@autorescue.com");
        providerUser1.setPhone("+91 98450 20002");
        providerUser1.setPasswordHash(passwordEncoder.encode("Provider@123"));
        providerUser1.setRole(Role.PROVIDER);
        providerUser1.setAddress("42 Industrial Layout, Electronic City, Bengaluru");
        providerUser1 = userRepository.save(providerUser1);

        ProviderProfile provider1 = new ProviderProfile();
        provider1.setUser(providerUser1);
        provider1.setBusinessName("Apex Highway Recovery & Towing");
        provider1.setLicenseNumber("KA-TOW-2026-8841");
        provider1.setServiceArea("NH-44, Outer Ring Road, Electronic City & Central Bengaluru");
        provider1.setCity("Bengaluru");
        provider1.setLatitude(12.9352);
        provider1.setLongitude(77.6245);
        provider1.setVerificationStatus(VerificationStatus.APPROVED);
        provider1.setVerificationNotes("Verified fleet insurance, commercial towing permit, and hydraulic flatbed certification.");
        provider1.setAvailable(true);
        provider1.setSupportedCategories("Flatbed Towing, Breakdown Towing, Battery Jump-Start, Flat-Tyre Assistance, EV Roadside Assistance, Accident Recovery");
        provider1.setRatingAverage(4.9);
        provider1.setTotalReviews(1);
        provider1.setTotalCompletedJobs(1);
        provider1.setTotalEarnings(new BigDecimal("1575.00"));
        provider1 = providerProfileRepository.save(provider1);

        ProviderVehicle v1 = new ProviderVehicle();
        v1.setProviderProfile(provider1);
        v1.setVehicleType("Hydraulic Flatbed Carrier");
        v1.setMakeModel("BharatBenz 1217C Flatbed");
        v1.setRegistrationNumber("KA-01-AR-9901");
        v1.setCapacityTons(6.5);
        v1.setEquipmentDetails("Hydraulic tilt bed, 5-ton winch, EV insulated wheel skates, 24V booster pack");
        providerVehicleRepository.save(v1);

        ProviderVehicle v2 = new ProviderVehicle();
        v2.setProviderProfile(provider1);
        v2.setVehicleType("Rapid Response Service Van");
        v2.setMakeModel("Force Traveller Patrol Unit");
        v2.setRegistrationNumber("KA-01-AR-4420");
        v2.setCapacityTons(2.0);
        v2.setEquipmentDetails("Portable EV charger, 12V/24V Li-Ion jump starter, pneumatic tyre repair kit");
        providerVehicleRepository.save(v2);

        ProviderDocument d1 = new ProviderDocument();
        d1.setProviderProfile(provider1);
        d1.setDocumentType("Commercial Recovery & Towing Permit");
        d1.setDocumentNumber("RTO-KA-TOW-884199");
        d1.setFileUrl("https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80");
        d1.setVerificationStatus(VerificationStatus.APPROVED);
        providerDocumentRepository.save(d1);

        // 3. Seed Pending Provider User (for Admin Verification Queue testing)
        User providerUser2 = new User();
        providerUser2.setFullName("Suresh Nair");
        providerUser2.setEmail("pending.provider@autorescue.com");
        providerUser2.setPhone("+91 98450 20099");
        providerUser2.setPasswordHash(passwordEncoder.encode("Provider@123"));
        providerUser2.setRole(Role.PROVIDER);
        providerUser2.setAddress("Whitefield Main Road, Bengaluru");
        providerUser2 = userRepository.save(providerUser2);

        ProviderProfile provider2 = new ProviderProfile();
        provider2.setUser(providerUser2);
        provider2.setBusinessName("Metro Rapid Tow & Assist");
        provider2.setLicenseNumber("KA-TOW-2026-5102");
        provider2.setServiceArea("Whitefield, KR Puram & Old Madras Road");
        provider2.setCity("Bengaluru");
        provider2.setVerificationStatus(VerificationStatus.PENDING);
        provider2.setAvailable(true);
        provider2.setSupportedCategories("Under-Lift Towing, Two-Wheeler Towing, Battery Jump-Start, Emergency Fuel Delivery");
        provider2 = providerProfileRepository.save(provider2);

        ProviderDocument d2 = new ProviderDocument();
        d2.setProviderProfile(provider2);
        d2.setDocumentType("GST & Trade Registration Certificate");
        d2.setDocumentNumber("29AABCM9912K1Z5");
        d2.setFileUrl("https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80");
        d2.setVerificationStatus(VerificationStatus.PENDING);
        providerDocumentRepository.save(d2);

        // 4. Seed Customer User
        User customer = new User();
        customer.setFullName("Aarav Mehta");
        customer.setEmail("customer@autorescue.com");
        customer.setPhone("+91 98450 30003");
        customer.setPasswordHash(passwordEncoder.encode("Customer@123"));
        customer.setRole(Role.CUSTOMER);
        customer.setAddress("Indiranagar 100 Feet Road, Bengaluru");
        customer.setDefaultVehicleMake("Hyundai");
        customer.setDefaultVehicleModel("Creta SX(O)");
        customer.setDefaultVehicleRegistration("KA-03-NM-7821");
        customer.setDefaultVehicleType("SUV");
        customer = userRepository.save(customer);

        // 5. Seed 1 Completed & Paid Booking + Invoice + Review, and 1 Open Pending Booking
        ServiceCategory flatbed = serviceCategoryRepository.findByCode("FLATBED_TOWING").orElse(null);
        ServiceCategory battery = serviceCategoryRepository.findByCode("BATTERY_JUMP_START").orElse(null);

        if (flatbed != null) {
            Booking completedBooking = new Booking();
            completedBooking.setBookingCode("AR-2026-DEMO01");
            completedBooking.setCustomer(customer);
            completedBooking.setAssignedProvider(provider1);
            completedBooking.setServiceCategory(flatbed);
            completedBooking.setVehicleMake("Hyundai");
            completedBooking.setVehicleModel("Creta SX(O)");
            completedBooking.setVehicleYear("2024");
            completedBooking.setVehicleRegistration("KA-03-NM-7821");
            completedBooking.setVehicleType("SUV");
            completedBooking.setBreakdownType("Transmission Lockup");
            completedBooking.setProblemDescription("Automatic transmission warning light came on near Silk Board flyover; vehicle unable to shift into drive.");
            completedBooking.setAiSuggestedCategory("Flatbed Towing");
            completedBooking.setAiConfidenceNote("Simulated Triage Suggestion: Drivetrain lockup requires Flatbed Towing");
            completedBooking.setPickupAddress("Silk Board Junction Flyover Ramp, Hosur Road, Bengaluru");
            completedBooking.setDestinationAddress("Trident Hyundai Authorised Workshop, Domlur");
            completedBooking.setDistanceKm(5.0);
            completedBooking.setBaseFee(flatbed.getBaseFee());
            completedBooking.setRatePerKm(flatbed.getRatePerKm());
            completedBooking.setAdditionalCharges(flatbed.getAdditionalCharges());
            completedBooking.setEstimatedPrice(new BigDecimal("1575.00"));
            completedBooking.setFinalPrice(new BigDecimal("1575.00"));
            completedBooking.setStatus(BookingStatus.COMPLETED);
            completedBooking.setPaymentStatus(PaymentStatus.PAID);
            completedBooking.setEstimatedArrivalMinutes(18);
            completedBooking.setCompletedAt(LocalDateTime.now().minusHours(2));
            completedBooking = bookingRepository.save(completedBooking);

            Payment payment = new Payment();
            payment.setBooking(completedBooking);
            payment.setTransactionReference("TXN-AR-DEMO9910");
            payment.setPaymentMethod("UPI_MOCK");
            payment.setPaymentGateway("MOCK_DEMONSTRATION_GATEWAY");
            payment.setAmount(new BigDecimal("1575.00"));
            payment.setStatus("SUCCESS");
            payment.setMockPayment(true);
            payment.setPaidAt(LocalDateTime.now().minusHours(2));
            payment = paymentRepository.save(payment);

            BigDecimal subtotal = new BigDecimal("1575.00").divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
            BigDecimal tax = new BigDecimal("1575.00").subtract(subtotal);

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber("INV-2026-DEMO01");
            invoice.setBooking(completedBooking);
            invoice.setPayment(payment);
            invoice.setSubtotal(subtotal);
            invoice.setTaxAmount(tax);
            invoice.setTotalAmount(new BigDecimal("1575.00"));
            invoice.setIssuedToName(customer.getFullName());
            invoice.setIssuedToEmail(customer.getEmail());
            invoice.setProviderBusinessName(provider1.getBusinessName());
            invoiceRepository.save(invoice);

            Review review = new Review();
            review.setBooking(completedBooking);
            review.setCustomer(customer);
            review.setProviderProfile(provider1);
            review.setRating(5);
            review.setComment("Arrived in 18 minutes with a clean hydraulic flatbed. Loaded my SUV safely without a scratch!");
            reviewRepository.save(review);
        }

        if (battery != null) {
            Booking openBooking = new Booking();
            openBooking.setBookingCode("AR-2026-LIVE02");
            openBooking.setCustomer(customer);
            openBooking.setServiceCategory(battery);
            openBooking.setVehicleMake("Hyundai");
            openBooking.setVehicleModel("Creta SX(O)");
            openBooking.setVehicleYear("2024");
            openBooking.setVehicleRegistration("KA-03-NM-7821");
            openBooking.setVehicleType("SUV");
            openBooking.setBreakdownType("Dead 12V Battery");
            openBooking.setProblemDescription("Dashboard flickers and starter clicks when pressing start button at parking basement B1.");
            openBooking.setPickupAddress("100 Feet Road, Indiranagar Near Metro Station, Bengaluru");
            openBooking.setDestinationAddress("On-Spot Assistance");
            openBooking.setDistanceKm(4.0);
            openBooking.setBaseFee(battery.getBaseFee());
            openBooking.setRatePerKm(battery.getRatePerKm());
            openBooking.setAdditionalCharges(battery.getAdditionalCharges());
            openBooking.setEstimatedPrice(new BigDecimal("509.00"));
            openBooking.setFinalPrice(new BigDecimal("509.00"));
            openBooking.setStatus(BookingStatus.PENDING);
            openBooking.setPaymentStatus(PaymentStatus.UNPAID);
            openBooking.setEstimatedArrivalMinutes(15);
            openBooking = bookingRepository.save(openBooking);

            notificationAuditService.createNotification(
                    customer,
                    "Active Dispatch Request: " + openBooking.getBookingCode(),
                    "Your Battery Jump-Start request at Indiranagar is live and awaiting provider dispatch.",
                    "BOOKING_CREATED",
                    String.valueOf(openBooking.getId())
            );
            notificationAuditService.createNotification(
                    providerUser1,
                    "New Job Nearby: " + openBooking.getBookingCode(),
                    "Battery Jump-Start requested at 100 Feet Road, Indiranagar (Est. ₹509.00).",
                    "NEW_JOB",
                    String.valueOf(openBooking.getId())
            );
        }

        notificationAuditService.logAction(
                "SYSTEM",
                "SYSTEM",
                "SEED_INITIAL_DATA",
                "System",
                "V1",
                "Initialized demo accounts (Admin, Approved Provider, Pending Provider, Customer) and sample bookings"
        );
    }
}
