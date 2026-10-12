# AutoRescue — AI-Powered Roadside Assistance Platform

**AutoRescue** is a complete, full-stack Java 21 + Spring Boot 3 + React (Vite + TypeScript + Tailwind CSS) + PostgreSQL web application that connects stranded vehicle owners with verified towing operators, EV roadside specialists, and mobile mechanics.

---

## 1. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3, React Router v6, Axios, Lucide React Icons |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Web, Spring Data JPA, Spring Security 6, JJWT (0.12.6), Hibernate Validator, Maven |
| **Database** | PostgreSQL 17, Flyway Database Migrations (`V1__init_schema_and_seed.sql`) |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, Spring Security Test |
| **API Docs** | Springdoc OpenAPI 3 / Swagger UI (`/swagger-ui/index.html`) |

---

## 2. Project Structure

```text
AutoRescue/
├── frontend/
│   ├── src/
│   │   ├── components/       # ProtectedRoute role guard
│   │   ├── context/          # AuthContext (JWT session & expiration management)
│   │   ├── hooks/            # useToast notification system
│   │   ├── layouts/          # MainLayout (Deep Navy Blue & Safety Orange navigation)
│   │   ├── pages/            # LandingPage, AuthPage, CustomerDashboard, ProviderDashboard, AdminDashboard
│   │   ├── services/         # Axios API client with Bearer JWT interceptor
│   │   └── types/            # Complete TypeScript interfaces
│   ├── vercel.json           # SPA rewrite config for Vercel deployment
│   ├── Dockerfile            # Multi-stage Node + Nginx container build
│   └── package.json
├── backend/
│   ├── src/main/java/com/autorescue/
│   │   ├── config/           # SecurityConfig, OpenApiConfig, WebMvcConfig, DataInitializer
│   │   ├── controller/       # Auth, Customer, ServiceCatalog, Booking, Provider, Admin REST Controllers
│   │   ├── dto/              # Validated Request/Response DTOs
│   │   ├── entity/           # 14 JPA Entities & Enums
│   │   ├── exception/        # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/       # 14 Spring Data JPA Repositories
│   │   ├── security/         # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│   │   └── service/          # Transactional Business Services
│   ├── src/main/resources/
│   │   ├── db/migration/     # Flyway SQL migration (V1__init_schema_and_seed.sql)
│   │   └── application.yml   # Spring Boot & environment variable configuration
│   ├── src/test/             # JUnit 5 & Mockito unit tests
│   ├── Dockerfile            # Multi-stage Maven + Eclipse Temurin 21 JRE build
│   └── pom.xml
├── docker-compose.yml        # PostgreSQL 17 + Backend + Frontend orchestration
├── .gitignore
└── README.md
```

---

## 3. Database Entities (PostgreSQL + Flyway)

All application records are persisted in PostgreSQL (`autorescue` database) across **14 relational entities**:
1. `User` (`users`)
2. `ProviderProfile` (`provider_profiles`)
3. `ProviderVehicle` (`provider_vehicles`)
4. `ProviderDocument` (`provider_documents`)
5. `ServiceCategory` (`service_categories`)
6. `PricingRule` (`pricing_rules`)
7. `Booking` (`bookings`)
8. `BookingPhoto` (`booking_photos`)
9. `ProviderBid` (`provider_bids`)
10. `Payment` (`payments`)
11. `Invoice` (`invoices`)
12. `Review` (`reviews`)
13. `Notification` (`notifications`)
14. `AuditLog` (`audit_logs`)

---

## 4. Roadside Services & Pricing Formula

All 10 categories are seeded in PostgreSQL via Flyway:
1. **Flatbed Towing**
2. **Under-Lift Towing**
3. **Two-Wheeler Towing**
4. **Heavy Vehicle Recovery**
5. **Accident Recovery**
6. **Breakdown Towing**
7. **Battery Jump-Start**
8. **Flat-Tyre Assistance**
9. **Emergency Fuel Delivery**
10. **EV Roadside Assistance**

**Transparent Pricing Formula:**
$$\text{Estimated Price} = \text{Base Fee} + (\text{Distance in km} \times \text{Rate Per Kilometre}) + \text{Additional Charges}$$

---

## 5. Pre-Seeded Verified Demo Accounts

When the backend starts, `DataInitializer` seeds verified demo accounts in PostgreSQL (also accessible via 1-click buttons on the Login screen):

| Role | Email | Password | Status / Notes |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@autorescue.com` | `Customer@123` | Pre-configured with default SUV & sample bookings |
| **PROVIDER (Approved)** | `provider@autorescue.com` | `Provider@123` | `APPROVED` — Can accept jobs, bid, and update statuses |
| **PROVIDER (Pending)** | `pending.provider@autorescue.com` | `Provider@123` | `PENDING` — For testing Admin verification approval |
| **ADMIN** | `admin@autorescue.com` | `Admin@123` | Full access to Admin Command Center & verification APIs |

---

## 6. Local Setup, Execution & Testing Instructions

### Prerequisites
- **Java 21** (`java -version`)
- **Maven 3.9+** (`mvn -version`)
- **Node.js 20+ & npm** (`node -v`, `npm -v`)
- **PostgreSQL 15 / 16 / 17** running on `localhost:5432`

### Step 1: Start PostgreSQL & Create `autorescue` Database
If using a local PostgreSQL 17 installation:
```powershell
createdb -h localhost -p 5432 -U postgres autorescue
```
*(Or use the local `.pgdata` cluster initialized in the workspace: `"C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D .pgdata -l .pgdata\logfile.log start`)*

### Step 2: Run the Backend (Port 8080)
```powershell
cd backend
mvn spring-boot:run
```
- **Backend API Base URL:** `http://localhost:8080/api`
- **Swagger OpenAPI UI:** `http://localhost:8080/swagger-ui/index.html`

### Step 3: Run the Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
- **Frontend Application URL:** `http://localhost:5173`

### Step 4: Run Automated Tests & Production Builds
```powershell
# Backend JUnit 5 + Mockito Tests
cd backend
mvn test

# Frontend TypeScript + Vite Production Build
cd ../frontend
npm run build
```

---

## 7. Key REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new `CUSTOMER` or `PROVIDER` (blocks self-registration as `ADMIN`)
- `POST /api/auth/login` — Authenticate with BCrypt and receive a signed JWT
- `POST /api/auth/logout` — Revoke current JWT token
- `GET /api/auth/me` — Get current authenticated user profile

### Customer
- `GET /api/customers/me` — Get customer profile
- `PATCH /api/customers/me` — Update customer profile & default vehicle
- `GET /api/customers/bookings` — List customer bookings
- `GET /api/customers/payments` — List customer payment history
- `GET /api/customers/notifications` — List notifications

### Roadside Services & Mock AI
- `GET /api/services` — List active roadside services
- `GET /api/services/{id}` — Get service details by ID
- `POST /api/services/estimate` — Calculate estimated price using the pricing formula
- `POST /api/services/ai-analyze` — Upload breakdown photo & run clearly labelled Mock AI Classifier

### Bookings, Payments, Invoices & Reviews
- `POST /api/bookings` — Create a new booking in PostgreSQL
- `GET /api/bookings` — List bookings for current user
- `GET /api/bookings/{id}` — Get booking details (enforces ownership verification)
- `PATCH /api/bookings/{id}/cancel` — Cancel an eligible booking
- `POST /api/bookings/{id}/pay` — Process payment and generate 18% GST Invoice
- `POST /api/bookings/{id}/review` — Submit 1–5★ customer review on completed booking
- `POST /api/bookings/{id}/dispute` — Raise a complaint/dispute

### Provider
- `POST /api/providers/register` — Register or update business profile
- `GET /api/providers/me` — Get provider profile, vehicles, documents, and earnings
- `GET /api/providers/jobs` — Get available open jobs and assigned jobs
- `PATCH /api/providers/availability` — Toggle ONLINE/OFFLINE availability
- `POST /api/providers/jobs/{id}/accept` — Accept an available job (requires `APPROVED` status)
- `POST /api/providers/jobs/{id}/bids` — Submit price and ETA bid on an open job
- `PATCH /api/providers/jobs/{id}/status` — Update job status (`ACCEPTED` → `EN_ROUTE` → `IN_PROGRESS` → `COMPLETED`)

### Admin (Requires `ROLE_ADMIN`)
- `GET /api/admin/analytics` — Platform KPIs & revenue summary
- `GET /api/admin/customers` — List and search customers
- `GET /api/admin/providers` — List providers and compliance documents
- `PATCH /api/admin/providers/{id}/verification` — Approve, reject, or suspend provider verification
- `GET /api/admin/bookings` — View all bookings & disputes
- `POST /api/admin/payments/{id}/refund` — Issue payment refund

---

## 8. Deployment Preparation

### Frontend (Vercel)
1. Import the repository into Vercel and set the Root Directory to `frontend`.
2. `frontend/vercel.json` is pre-configured for SPA client-side routing.
3. Configure Environment Variable:
   - `VITE_API_BASE_URL=https://your-backend-host.example.com/api`

### Backend (Render / Railway / Fly.io / Docker)
1. Use `backend/Dockerfile` or Maven buildpack (`mvn clean package -DskipTests`).
2. Configure Required Environment Variables:
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://<db-host>:5432/autorescue`
   - `SPRING_DATASOURCE_USERNAME=<db-user>`
   - `SPRING_DATASOURCE_PASSWORD=<db-password>`
   - `JWT_SECRET=<at-least-256-bit-random-secret>`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `RAZORPAY_KEY_ID=<optional-razorpay-test-key>`
   - `RAZORPAY_KEY_SECRET=<optional-razorpay-test-secret>`

---

## 9. Compliance & Feature Notes
- **AI Breakdown Classifier:** Implemented as a clearly labelled heuristic/mock triage classifier (`MOCK_RULE_BASED_CLASSIFIER`). The UI explicitly informs customers that a photograph cannot definitively diagnose internal mechanical faults and lets customers confirm or override the suggested service category.
- **Payments & Invoicing:** Supports Razorpay Test Mode fields when configured, and provides a clearly labelled Demonstration Payment Gateway (`MOCK_DEMONSTRATION_GATEWAY`) that records transactions in PostgreSQL and generates itemized 18% GST tax invoices (`INV-2026-XXXX`).
