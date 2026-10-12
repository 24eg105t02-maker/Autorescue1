export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  address?: string;
  defaultVehicleMake?: string;
  defaultVehicleModel?: string;
  defaultVehicleRegistration?: string;
  defaultVehicleType?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface ServiceCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  supportedVehicleTypes: string;
  baseFee: number;
  ratePerKm: number;
  additionalCharges: number;
  estimatedEtaMinutes: number;
  active: boolean;
  iconName: string;
}

export interface PriceEstimateResponse {
  serviceCategoryId: number;
  serviceName: string;
  distanceKm: number;
  baseFee: number;
  ratePerKm: number;
  distanceCost: number;
  additionalCharges: number;
  estimatedPrice: number;
  formulaExplanation: string;
  disclaimer: string;
}

export interface AiAnalyzeResponse {
  mockClassifier: boolean;
  classifierType: string;
  suggestedBreakdownType: string;
  suggestedServiceCode: string;
  suggestedServiceName: string;
  suggestedServiceCategoryId: number;
  confidenceLabel: string;
  analysisReasoning: string;
  diagnosticDisclaimer: string;
  uploadedPhotoUrl?: string;
}

export interface BookingPhoto {
  id: number;
  fileUrl: string;
  fileName: string;
  aiAnalysisLabel?: string;
  uploadedAt: string;
}

export interface ProviderBid {
  id: number;
  bookingId: number;
  providerProfileId: number;
  providerBusinessName: string;
  providerPhone: string;
  providerRating: number;
  quotedPrice: number;
  estimatedArrivalMinutes: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface PaymentItem {
  id: number;
  bookingId: number;
  bookingCode: string;
  serviceCategoryName: string;
  transactionReference: string;
  paymentMethod: string;
  paymentGateway: string;
  amount: number;
  status: string;
  mockPayment: boolean;
  paidAt: string;
  invoiceNumber?: string;
}

export interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  bookingId: number;
  bookingCode: string;
  serviceName: string;
  vehicleDetails: string;
  pickupAddress: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issuedToName: string;
  issuedToEmail: string;
  providerBusinessName: string;
  transactionReference: string;
  mockPayment: boolean;
  issuedAt: string;
}

export interface ReviewItem {
  id: number;
  bookingId: number;
  bookingCode: string;
  serviceCategoryName: string;
  customerName: string;
  providerBusinessName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingCode: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  assignedProviderId?: number;
  assignedProviderBusinessName?: string;
  assignedProviderPhone?: string;
  assignedProviderRating?: number;
  assignedProviderLat?: number;
  assignedProviderLng?: number;
  serviceCategoryId: number;
  serviceCategoryName: string;
  serviceCategoryCode: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  vehicleRegistration: string;
  vehicleType: string;
  breakdownType: string;
  problemDescription: string;
  aiSuggestedCategory?: string;
  aiConfidenceNote?: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  distanceKm: number;
  baseFee: number;
  ratePerKm: number;
  additionalCharges: number;
  estimatedPrice: number;
  finalPrice?: number;
  status: 'PENDING' | 'BIDDING' | 'ACCEPTED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  cancellationReason?: string;
  estimatedArrivalMinutes?: number;
  disputeStatus?: string;
  disputeReason?: string;
  disputeResolution?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  photos: BookingPhoto[];
  bids: ProviderBid[];
  payment?: PaymentItem;
  invoice?: InvoiceItem;
  review?: ReviewItem;
}

export interface ProviderVehicle {
  id: number;
  vehicleType: string;
  makeModel: string;
  registrationNumber: string;
  capacityTons: number;
  equipmentDetails?: string;
  active: boolean;
  createdAt: string;
}

export interface ProviderDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  uploadedAt: string;
}

export interface ProviderProfile {
  id: number;
  userId: number;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  licenseNumber: string;
  serviceArea: string;
  city: string;
  latitude: number;
  longitude: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verificationNotes?: string;
  available: boolean;
  supportedCategories: string;
  ratingAverage: number;
  totalReviews: number;
  totalCompletedJobs: number;
  totalEarnings: number;
  createdAt: string;
  vehicles: ProviderVehicle[];
  documents: ProviderDocument[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminAnalytics {
  totalCustomers: number;
  totalProviders: number;
  pendingVerifications: number;
  approvedProviders: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  openDisputes: number;
  totalRevenue: number;
  bookingsByCategory: Record<string, number>;
}

export interface AuditLogItem {
  id: number;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}
