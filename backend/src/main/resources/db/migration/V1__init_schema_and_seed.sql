-- V1__init_schema_and_seed.sql
-- AutoRescue Complete Relational Schema and Roadside Service Catalog Seed

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    address VARCHAR(255),
    default_vehicle_make VARCHAR(80),
    default_vehicle_model VARCHAR(80),
    default_vehicle_registration VARCHAR(40),
    default_vehicle_type VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE provider_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(80) NOT NULL UNIQUE,
    service_area VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION DEFAULT 12.9716,
    longitude DOUBLE PRECISION DEFAULT 77.5946,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verification_notes VARCHAR(500),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    supported_categories VARCHAR(500) NOT NULL,
    rating_average DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    total_completed_jobs INTEGER NOT NULL DEFAULT 0,
    total_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_verification ON provider_profiles(verification_status);
CREATE INDEX idx_provider_available ON provider_profiles(available);

CREATE TABLE provider_vehicles (
    id BIGSERIAL PRIMARY KEY,
    provider_profile_id BIGINT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(80) NOT NULL,
    make_model VARCHAR(120) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    capacity_tons DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    equipment_details VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_vehicles_provider ON provider_vehicles(provider_profile_id);

CREATE TABLE provider_documents (
    id BIGSERIAL PRIMARY KEY,
    provider_profile_id BIGINT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(80) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_docs_provider ON provider_documents(provider_profile_id);

CREATE TABLE service_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(600) NOT NULL,
    supported_vehicle_types VARCHAR(255) NOT NULL,
    base_fee NUMERIC(10, 2) NOT NULL,
    rate_per_km NUMERIC(10, 2) NOT NULL,
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_eta_minutes INTEGER NOT NULL DEFAULT 25,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    icon_name VARCHAR(60) NOT NULL DEFAULT 'Truck',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    service_category_id BIGINT NOT NULL UNIQUE REFERENCES service_categories(id) ON DELETE CASCADE,
    rule_name VARCHAR(120) NOT NULL,
    base_fee NUMERIC(10, 2) NOT NULL,
    rate_per_km NUMERIC(10, 2) NOT NULL,
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    night_surge_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(40) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    assigned_provider_id BIGINT REFERENCES provider_profiles(id),
    service_category_id BIGINT NOT NULL REFERENCES service_categories(id),
    vehicle_make VARCHAR(80) NOT NULL,
    vehicle_model VARCHAR(80) NOT NULL,
    vehicle_year VARCHAR(10),
    vehicle_registration VARCHAR(40) NOT NULL,
    vehicle_type VARCHAR(40) NOT NULL,
    breakdown_type VARCHAR(100) NOT NULL,
    problem_description VARCHAR(1000) NOT NULL,
    ai_suggested_category VARCHAR(120),
    ai_confidence_note VARCHAR(500),
    pickup_address VARCHAR(350) NOT NULL,
    destination_address VARCHAR(350),
    pickup_latitude DOUBLE PRECISION DEFAULT 12.9716,
    pickup_longitude DOUBLE PRECISION DEFAULT 77.5946,
    distance_km DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    base_fee NUMERIC(10, 2) NOT NULL,
    rate_per_km NUMERIC(10, 2) NOT NULL,
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_price NUMERIC(10, 2) NOT NULL,
    final_price NUMERIC(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    cancellation_reason VARCHAR(500),
    estimated_arrival_minutes INTEGER DEFAULT 25,
    dispute_status VARCHAR(30) DEFAULT 'NONE',
    dispute_reason VARCHAR(500),
    dispute_resolution VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(assigned_provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_code ON bookings(booking_code);

CREATE TABLE booking_photos (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    ai_analysis_label VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id);

CREATE TABLE provider_bids (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    provider_profile_id BIGINT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    quoted_price NUMERIC(10, 2) NOT NULL,
    estimated_arrival_minutes INTEGER NOT NULL,
    notes VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_bids_booking ON provider_bids(booking_id);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_mock_payment BOOLEAN NOT NULL DEFAULT TRUE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_booking ON payments(booking_id);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(60) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    issued_to_name VARCHAR(150) NOT NULL,
    issued_to_email VARCHAR(160) NOT NULL,
    provider_business_name VARCHAR(150) NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    provider_profile_id BIGINT NOT NULL REFERENCES provider_profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_provider ON reviews(provider_profile_id);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(600) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(80),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_email VARCHAR(160) NOT NULL,
    actor_role VARCHAR(40) NOT NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80),
    details VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed 10 Roadside Service Categories
INSERT INTO service_categories (code, name, description, supported_vehicle_types, base_fee, rate_per_km, additional_charges, estimated_eta_minutes, active, icon_name) VALUES
('FLATBED_TOWING', 'Flatbed Towing', 'Zero-wear hydraulic flatbed transport ideal for luxury vehicles, AWD/4WD cars, immobilized vehicles, and long-distance recovery.', 'Sedan, SUV, Luxury, EV, Sports Car', 1200.00, 45.00, 150.00, 25, TRUE, 'Truck'),
('UNDER_LIFT_TOWING', 'Under-Lift Towing', ' Hydraulic wheel-lift towing system designed for quick urban extraction, tight parking structures, and standard two-wheel-drive vehicles.', 'Hatchback, Sedan, Compact SUV', 850.00, 35.00, 100.00, 20, TRUE, 'Navigation'),
('TWO_WHEELER_TOWING', 'Two-Wheeler Towing', 'Specialized motorcycle and scooter carrier with wheel chocks and soft-strap tie-downs for safe two-wheeler transport.', 'Motorcycle, Scooter, Superbike, EV Bike', 450.00, 20.00, 50.00, 18, TRUE, 'Bike'),
('HEAVY_VEHICLE_RECOVERY', 'Heavy Vehicle Recovery', 'High-capacity rotator and heavy-duty winch recovery for commercial trucks, buses, vans, and loaded fleet vehicles.', 'Commercial Truck, Bus, Tempo Traveller, Heavy Van', 2800.00, 85.00, 400.00, 40, TRUE, 'ShieldAlert'),
('ACCIDENT_RECOVERY', 'Accident Recovery', 'Emergency collision extraction, off-road winching, debris clearance coordination, and secure transport to authorized repair centers.', 'All Vehicle Types (2W, 4W, SUV, Commercial)', 1800.00, 55.00, 300.00, 22, TRUE, 'AlertTriangle'),
('BREAKDOWN_TOWING', 'Breakdown Towing', 'Standard emergency towing for sudden engine stalls, transmission failure, overheating, or clutch breakdown on highways and city roads.', 'Hatchback, Sedan, SUV, MPV', 950.00, 38.00, 100.00, 24, TRUE, 'Wrench'),
('BATTERY_JUMP_START', 'Battery Jump-Start', 'On-spot 12V/24V professional booster jump-start, alternator charging check, and battery terminal diagnostics.', 'Hatchback, Sedan, SUV, Motorcycle, EV (12V Aux)', 399.00, 15.00, 50.00, 15, TRUE, 'BatteryCharging'),
('FLAT_TYRE_ASSISTANCE', 'Flat-Tyre Assistance', 'On-site spare wheel replacement, tubeless puncture repair, portable air inflation, and valve inspection.', 'Hatchback, Sedan, SUV, Motorcycle', 349.00, 15.00, 40.00, 15, TRUE, 'Disc'),
('EMERGENCY_FUEL_DELIVERY', 'Emergency Fuel Delivery', 'Emergency delivery of up to 5 litres of Petrol or Diesel directly to your stranded location (fuel cost settled as per actuals + delivery fee).', 'Petrol & Diesel Cars, SUVs, Motorcycles', 449.00, 18.00, 60.00, 20, TRUE, 'Fuel'),
('EV_ROADSIDE_ASSISTANCE', 'EV Roadside Assistance', 'Portable DC fast-charge boost to reach the nearest charging station, high-voltage safety isolation check, or flatbed EV transport.', 'Electric Cars, Electric SUVs, Electric Two-Wheelers', 1400.00, 42.00, 200.00, 25, TRUE, 'Zap');

-- Seed matching Pricing Rules
INSERT INTO pricing_rules (service_category_id, rule_name, base_fee, rate_per_km, additional_charges, night_surge_multiplier, active)
SELECT id, name || ' Standard Tariff', base_fee, rate_per_km, additional_charges, 1.00, TRUE
FROM service_categories;
