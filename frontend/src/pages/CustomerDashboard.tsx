import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  MapPin,
  CreditCard,
  User,
  Bell,
  Camera,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  FileText,
  AlertTriangle,
  Phone,
  Truck,
  RefreshCw,
  Printer,
  ShieldAlert,
  Navigation,
} from 'lucide-react';
import { api, extractErrorMessage } from '../services/api';
import {
  AiAnalyzeResponse,
  Booking,
  NotificationItem,
  PaymentItem,
  PriceEstimateResponse,
  ServiceCategory,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ServiceIcon } from './LandingPage';

type CustomerTab =
  | 'overview'
  | 'book'
  | 'bookings'
  | 'details'
  | 'track'
  | 'payments'
  | 'profile'
  | 'notifications';

export const CustomerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as CustomerTab) || 'overview';
  const preselectedServiceId = searchParams.get('serviceId');

  const [activeTab, setActiveTab] = useState<CustomerTab>(initialTab);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State (12-Step Workflow)
  const [vehicleMake, setVehicleMake] = useState(user?.defaultVehicleMake || 'Hyundai');
  const [vehicleModel, setVehicleModel] = useState(user?.defaultVehicleModel || 'Creta SX');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehicleRegistration, setVehicleRegistration] = useState(
    user?.defaultVehicleRegistration || 'KA-03-NM-7821'
  );
  const [vehicleType, setVehicleType] = useState(user?.defaultVehicleType || 'SUV');
  const [breakdownType, setBreakdownType] = useState('Dead Battery / Electrical Stall');
  const [problemDescription, setProblemDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState(
    user?.address || 'MG Road Metro Station, Near Trinity Circle, Bengaluru'
  );
  const [destinationAddress, setDestinationAddress] = useState(
    'Authorized Service Center / Nearest Garage'
  );
  const [distanceKm, setDistanceKm] = useState<number>(6);
  const [serviceCategoryId, setServiceCategoryId] = useState<number>(1);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalyzeResponse | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimateResponse | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Modals / Actions state
  const [cancelReason, setCancelReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI_MOCK');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [invoiceModalBooking, setInvoiceModalBooking] = useState<Booking | null>(null);

  // Profile Form State
  const [profName, setProfName] = useState(user?.fullName || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profAddress, setProfAddress] = useState(user?.address || '');
  const [profMake, setProfMake] = useState(user?.defaultVehicleMake || '');
  const [profModel, setProfModel] = useState(user?.defaultVehicleModel || '');
  const [profReg, setProfReg] = useState(user?.defaultVehicleRegistration || '');
  const [profType, setProfType] = useState(user?.defaultVehicleType || 'SUV');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const [srvRes, bookRes, payRes, notifRes] = await Promise.all([
        api.get<ServiceCategory[]>('/services'),
        api.get<Booking[]>('/customers/bookings'),
        api.get<PaymentItem[]>('/customers/payments'),
        api.get<NotificationItem[]>('/customers/notifications'),
      ]);
      setServices(srvRes.data);
      setBookings(bookRes.data);
      setPayments(payRes.data);
      setNotifications(notifRes.data);

      if (preselectedServiceId) {
        const found = srvRes.data.find((s) => s.id === Number(preselectedServiceId));
        if (found) setServiceCategoryId(found.id);
      } else if (srvRes.data.length > 0 && serviceCategoryId === 1) {
        setServiceCategoryId(srvRes.data[0].id);
      }

      if (bookRes.data.length > 0) {
        setSelectedBooking((prev) => {
          if (prev) {
            return bookRes.data.find((b) => b.id === prev.id) || bookRes.data[0];
          }
          return bookRes.data[0];
        });
      }
    } catch (err) {
      showToast('error', 'Failed to load data', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [preselectedServiceId, serviceCategoryId, showToast]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as CustomerTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const switchTab = (tab: CustomerTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Real-time Price Estimate calculation via Backend API
  useEffect(() => {
    if (!serviceCategoryId || distanceKm <= 0) return;
    const timer = setTimeout(async () => {
      try {
        const res = await api.post<PriceEstimateResponse>('/services/estimate', {
          serviceCategoryId,
          distanceKm,
        });
        setPriceEstimate(res.data);
      } catch {
        // Ignore transient estimate error
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [serviceCategoryId, distanceKm]);

  // Handle Photo Upload + Mock AI Classifier
  const handlePhotoAndAiTriage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAiAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('hintText', `${breakdownType} ${problemDescription}`);
      formData.append('vehicleType', vehicleType);

      const res = await api.post<AiAnalyzeResponse>('/services/ai-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAiAnalysis(res.data);
      if (res.data.uploadedPhotoUrl) {
        setPhotoUrls((prev) => [...prev, res.data.uploadedPhotoUrl!]);
      }
      showToast(
        'info',
        `Mock AI Suggested: ${res.data.suggestedServiceName}`,
        'Review the suggestion below and click Confirm or select your preferred category.'
      );
    } catch (err) {
      showToast('error', 'Photo Analysis Error', extractErrorMessage(err));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleRunTextAiTriage = async () => {
    setAiAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('hintText', `${breakdownType} ${problemDescription}`);
      formData.append('vehicleType', vehicleType);

      const res = await api.post<AiAnalyzeResponse>('/services/ai-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAiAnalysis(res.data);
      showToast('info', `Mock AI Triage: ${res.data.suggestedServiceName}`, res.data.analysisReasoning);
    } catch (err) {
      showToast('error', 'AI Triage Error', extractErrorMessage(err));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      showToast('error', 'Validation Error', 'Please enter a brief description of the breakdown problem.');
      return;
    }
    setBookingSubmitting(true);
    try {
      const res = await api.post<Booking>('/bookings', {
        serviceCategoryId,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleRegistration,
        vehicleType,
        breakdownType,
        problemDescription,
        aiSuggestedCategory: aiAnalysis?.suggestedServiceName,
        aiConfidenceNote: aiAnalysis?.confidenceLabel,
        pickupAddress,
        destinationAddress,
        distanceKm,
        photoUrls,
      });
      showToast(
        'success',
        `Booking Confirmed: ${res.data.bookingCode}`,
        'Your request has been saved in PostgreSQL and broadcast to verified providers.'
      );
      setProblemDescription('');
      setPhotoUrls([]);
      await loadCustomerData();
      setSelectedBooking(res.data);
      switchTab('details');
    } catch (err) {
      showToast('error', 'Could not create booking', extractErrorMessage(err));
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const res = await api.patch<Booking>(`/bookings/${bookingId}/cancel`, {
        reason: cancelReason || 'Customer requested cancellation',
      });
      showToast('info', `Booking ${res.data.bookingCode} Cancelled`, res.data.cancellationReason);
      setCancelReason('');
      await loadCustomerData();
      setSelectedBooking(res.data);
    } catch (err) {
      showToast('error', 'Cancellation Failed', extractErrorMessage(err));
    }
  };

  const handleAcceptBid = async (bookingId: number, bidId: number) => {
    try {
      const res = await api.post<Booking>(`/bookings/${bookingId}/bids/${bidId}/accept`);
      showToast('success', 'Bid Accepted!', `${res.data.assignedProviderBusinessName} is now assigned to your job.`);
      await loadCustomerData();
      setSelectedBooking(res.data);
    } catch (err) {
      showToast('error', 'Failed to accept bid', extractErrorMessage(err));
    }
  };

  const handlePayBooking = async (bookingId: number) => {
    setProcessingPayment(true);
    try {
      const res = await api.post<Booking>(`/bookings/${bookingId}/pay`, {
        bookingId,
        paymentMethod,
      });
      showToast(
        'success',
        'Payment Completed & Invoice Generated!',
        `Invoice ${res.data.invoice?.invoiceNumber} is now available.`
      );
      await loadCustomerData();
      setSelectedBooking(res.data);
      setInvoiceModalBooking(res.data);
    } catch (err) {
      showToast('error', 'Payment Error', extractErrorMessage(err));
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingReview(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/review`, {
        bookingId: selectedBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('success', 'Review Submitted!', 'Thank you for rating your roadside assistance provider.');
      setReviewComment('');
      await loadCustomerData();
    } catch (err) {
      showToast('error', 'Review Submission Error', extractErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRaiseDispute = async (bookingId: number) => {
    if (!disputeReason.trim()) {
      showToast('error', 'Dispute Reason Required', 'Please describe your issue before submitting.');
      return;
    }
    try {
      const res = await api.post<Booking>(`/bookings/${bookingId}/dispute`, {
        reason: disputeReason,
      });
      showToast('info', 'Dispute Logged', 'Platform Admin has been notified of your complaint.');
      setDisputeReason('');
      await loadCustomerData();
      setSelectedBooking(res.data);
    } catch (err) {
      showToast('error', 'Failed to raise dispute', extractErrorMessage(err));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/customers/me', {
        fullName: profName,
        phone: profPhone,
        address: profAddress,
        defaultVehicleMake: profMake,
        defaultVehicleModel: profModel,
        defaultVehicleRegistration: profReg,
        defaultVehicleType: profType,
      });
      await refreshUser();
      showToast('success', 'Profile Updated', 'Your customer details and default vehicle have been saved.');
    } catch (err) {
      showToast('error', 'Update Failed', extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/customers/notifications/read-all');
      await loadCustomerData();
      showToast('success', 'Notifications Cleared', 'All notifications marked as read.');
    } catch (err) {
      showToast('error', 'Error', extractErrorMessage(err));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeBookingsList = bookings.filter(
    (b) => !['COMPLETED', 'CANCELLED'].includes(b.status)
  );
  const completedBookingsList = bookings.filter((b) => b.status === 'COMPLETED');

  const statusBadge = (status: Booking['status']) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
      BIDDING: 'bg-blue-100 text-blue-800 border-blue-300',
      ACCEPTED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      EN_ROUTE: 'bg-safety-100 text-safety-800 border-safety-300',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
      COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[status] || ''}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Customer Header */}
      <div className="navy-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-safety-400">
            Customer Assistance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Default Vehicle: {user?.defaultVehicleMake || 'Hyundai'} {user?.defaultVehicleModel || 'Creta'} ({user?.defaultVehicleRegistration || 'KA-03-NM-7821'})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => switchTab('book')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-sm shadow-lg shadow-safety-500/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Book Emergency Assistance
          </button>
          <button
            onClick={loadCustomerData}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold border border-navy-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-6 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'book', label: 'Book Assistance', icon: <PlusCircle className="w-4 h-4" /> },
          { id: 'bookings', label: `My Bookings (${bookings.length})`, icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'details', label: 'Booking Details', icon: <FileText className="w-4 h-4" /> },
          { id: 'track', label: 'Track Provider', icon: <MapPin className="w-4 h-4" /> },
          { id: 'payments', label: `Payment History (${payments.length})`, icon: <CreditCard className="w-4 h-4" /> },
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          {
            id: 'notifications',
            label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
            icon: <Bell className="w-4 h-4" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id as CustomerTab)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">Total Bookings</p>
              <p className="text-3xl font-extrabold text-navy-900 mt-2">{bookings.length}</p>
              <p className="text-xs text-slate-500 mt-1">Saved in PostgreSQL</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-safety-600">Active Rescues</p>
              <p className="text-3xl font-extrabold text-safety-600 mt-2">
                {activeBookingsList.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Awaiting or in-progress</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-600">Completed Rescues</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {completedBookingsList.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Eligible for invoices & reviews</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-navy-700">Unread Alerts</p>
              <p className="text-3xl font-extrabold text-navy-900 mt-2">{unreadCount}</p>
              <button
                onClick={() => switchTab('notifications')}
                className="text-xs font-bold text-safety-600 hover:underline mt-1"
              >
                View Notifications →
              </button>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Recent Roadside Bookings</h2>
                <p className="text-xs text-slate-500">Click any booking to inspect status, track provider, pay, or download invoice</p>
              </div>
              <button
                onClick={() => switchTab('book')}
                className="px-3.5 py-2 rounded-xl bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold"
              >
                + New Booking
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-500 mb-3">You have not created any bookings yet.</p>
                <button
                  onClick={() => switchTab('book')}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold"
                >
                  Book Your First Roadside Assistance
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-3.5 px-4">Booking ID</th>
                      <th className="py-3.5 px-4">Service & Vehicle</th>
                      <th className="py-3.5 px-4">Pickup Location</th>
                      <th className="py-3.5 px-4">Assigned Provider</th>
                      <th className="py-3.5 px-4">Est. / Final Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-900 text-xs">
                          {b.bookingCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-navy-900 text-xs">{b.serviceCategoryName}</p>
                          <p className="text-xs text-slate-500">
                            {b.vehicleMake} {b.vehicleModel} ({b.vehicleRegistration})
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                          {b.pickupAddress}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {b.assignedProviderBusinessName ? (
                            <div>
                              <p className="font-semibold text-navy-900">
                                {b.assignedProviderBusinessName}
                              </p>
                              <p className="text-[11px] text-slate-500">{b.assignedProviderPhone}</p>
                            </div>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              Broadcasting ({b.bids?.length || 0} bids)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-navy-900 text-xs">
                            ₹{b.finalPrice || b.estimatedPrice}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : b.paymentStatus === 'REFUNDED'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{statusBadge(b.status)}</td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              switchTab('details');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              switchTab('track');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-safety-500 hover:bg-safety-600 text-white text-xs font-semibold"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOK ASSISTANCE (12-STEP WORKFLOW) */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-safety-600">
                Complete 12-Step Dispatch Workflow
              </span>
              <h2 className="text-2xl font-extrabold text-navy-900 mt-1">
                Book Emergency Roadside Assistance
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your vehicle and breakdown details below. All bookings are persisted in PostgreSQL with a unique Booking ID.
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* Step 1: Vehicle Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center">
                    1
                  </span>
                  Step 1: Enter Vehicle Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Make *</label>
                    <input
                      type="text"
                      required
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="Hyundai"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Creta SX"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registration *</label>
                    <input
                      type="text"
                      required
                      value={vehicleRegistration}
                      onChange={(e) => setVehicleRegistration(e.target.value)}
                      placeholder="KA-03-NM-7821"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Class *</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Motorcycle">Motorcycle / 2W</option>
                      <option value="EV">Electric Vehicle (EV)</option>
                      <option value="Commercial">Commercial Truck / Bus</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2, 3, 4: Breakdown Type, Description & Mock AI Photo Triage */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center">
                    2
                  </span>
                  Steps 2–4: Breakdown Problem & Optional AI Photo Triage
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Breakdown Symptom / Type *
                    </label>
                    <select
                      value={breakdownType}
                      onChange={(e) => setBreakdownType(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Dead Battery / Electrical Stall">Dead Battery / Electrical Stall</option>
                      <option value="Flat Tyre / Puncture">Flat Tyre / Puncture</option>
                      <option value="Engine Overheating / Mechanical Breakdown">Engine Overheating / Mechanical Breakdown</option>
                      <option value="Transmission / Gearbox Lockup">Transmission / Gearbox Lockup</option>
                      <option value="Out of Fuel (Petrol / Diesel)">Out of Fuel (Petrol / Diesel)</option>
                      <option value="EV High-Voltage / Range Depletion">EV High-Voltage / Range Depletion</option>
                      <option value="Accident / Collision Damage">Accident / Collision Damage</option>
                      <option value="Two-Wheeler Breakdown">Two-Wheeler Breakdown</option>
                      <option value="Heavy Commercial Vehicle Stall">Heavy Commercial Vehicle Stall</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Breakdown Photo (Optional — Triggers Mock AI Classifier)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-navy-400 bg-white hover:bg-navy-50 text-xs font-semibold text-navy-800 transition">
                        <Camera className="w-4 h-4 text-safety-500" />
                        <span>{aiAnalyzing ? 'Analyzing...' : 'Upload Photo (JPG/PNG)'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoAndAiTriage}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRunTextAiTriage}
                        disabled={aiAnalyzing}
                        className="px-3 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-safety-400" />
                        AI Suggest
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Problem Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Describe what happened (e.g., Front left tyre burst on flyover ramp, or starter clicks when turning key)..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Clearly Labelled Mock AI Classifier Output */}
                {aiAnalysis && (
                  <div className="p-4 rounded-2xl bg-navy-900 text-white border border-safety-500/40 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-safety-500 text-white text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        {aiAnalysis.classifierType}
                      </span>
                      <span className="text-xs text-slate-300">{aiAnalysis.confidenceLabel}</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      Suggested Service Category:{' '}
                      <span className="text-safety-400">{aiAnalysis.suggestedServiceName}</span>
                    </p>
                    <p className="text-xs text-slate-300">{aiAnalysis.analysisReasoning}</p>
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{aiAnalysis.diagnosticDisclaimer}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceCategoryId(aiAnalysis.suggestedServiceCategoryId);
                          showToast(
                            'success',
                            'Category Confirmed',
                            `Selected ${aiAnalysis.suggestedServiceName}`
                          );
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold"
                      >
                        Confirm & Use {aiAnalysis.suggestedServiceName}
                      </button>
                      <span className="text-[11px] text-slate-400">
                        Or manually select any service in Step 6 below.
                      </span>
                    </div>
                  </div>
                )}

                {photoUrls.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-emerald-700">
                      Uploaded Breakdown Photos ({photoUrls.length}):
                    </span>
                    {photoUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline text-navy-700 font-medium"
                      >
                        Photo #{idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 5: Pickup Location & Distance */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center">
                    3
                  </span>
                  Step 5: Pickup Location & Estimated Towing/Dispatch Distance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stranded Pickup Address / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Silk Board Flyover Ramp, Hosur Road, Bengaluru"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Drop-off Destination / Repair Center
                    </label>
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Authorized Service Center or On-Spot Repair"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Estimated Distance (Kilometres) *</span>
                    <span className="font-bold text-safety-600">{distanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={0.5}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-safety-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Step 6: Select Roadside Assistance Service */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center">
                    4
                  </span>
                  Step 6: Select Roadside Assistance Service Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {services.map((srv) => {
                    const isSelected = srv.id === serviceCategoryId;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setServiceCategoryId(srv.id)}
                        className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                          isSelected
                            ? 'border-safety-500 bg-safety-50/70 ring-2 ring-safety-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-navy-900 text-safety-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ServiceIcon name={srv.iconName} className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-navy-900 truncate">{srv.name}</p>
                            <span className="text-xs font-extrabold text-safety-600">
                              Base ₹{srv.baseFee}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {srv.supportedVehicleTypes}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            + ₹{srv.ratePerKm}/km • Addl: ₹{srv.additionalCharges} • ETA ~{srv.estimatedEtaMinutes}m
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-safety-500 hover:bg-safety-600 disabled:opacity-60 text-white font-extrabold text-base shadow-xl shadow-safety-500/30 transition"
              >
                {bookingSubmitting
                  ? 'Saving Booking to PostgreSQL...'
                  : `Confirm & Dispatch Rescue (Est. ₹${priceEstimate?.estimatedPrice || '...'})`}
              </button>
            </form>
          </div>

          {/* Right Summary Card: Steps 7, 8, 9 Price Formula & Review */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-xl border border-navy-800 space-y-5 sticky top-24">
              <div className="border-b border-navy-800 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-safety-400">
                  Steps 7–9: Live Price & Summary
                </span>
                <h3 className="text-xl font-extrabold mt-1">Booking Estimate Summary</h3>
              </div>

              {priceEstimate && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Selected Service:</span>
                    <span className="font-bold text-white">{priceEstimate.serviceName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vehicle:</span>
                    <span className="font-semibold text-white">
                      {vehicleMake} {vehicleModel} ({vehicleRegistration})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Dispatch Fee:</span>
                    <span className="font-mono">₹{priceEstimate.baseFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>
                      Distance ({priceEstimate.distanceKm} km × ₹{priceEstimate.ratePerKm}/km):
                    </span>
                    <span className="font-mono">₹{priceEstimate.distanceCost}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Additional Platform/Safety Fee:</span>
                    <span className="font-mono">₹{priceEstimate.additionalCharges}</span>
                  </div>

                  <div className="border-t border-navy-700 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold text-safety-400">
                        Total Estimated Price
                      </p>
                      <p className="text-[10px] text-slate-400">Configurable Demo Tariff</p>
                    </div>
                    <p className="text-3xl font-extrabold text-safety-400">
                      ₹{priceEstimate.estimatedPrice}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950/90 border border-navy-800 text-[11px] text-slate-300 space-y-1">
                    <p className="font-semibold text-white">Formula Applied:</p>
                    <p className="font-mono text-[10px] text-safety-300">
                      {priceEstimate.formulaExplanation}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1">{priceEstimate.disclaimer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-navy-900">
              All My Roadside Bookings ({bookings.length})
            </h2>
            <button
              onClick={() => switchTab('book')}
              className="px-4 py-2 rounded-xl bg-safety-500 text-white text-xs font-bold"
            >
              + Book New Rescue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-900 text-safety-400">
                      {b.bookingCode}
                    </span>
                    <div className="flex items-center gap-2">
                      {statusBadge(b.status)}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-navy-900">{b.serviceCategoryName}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Vehicle:</strong> {b.vehicleMake} {b.vehicleModel} ({b.vehicleRegistration}) • {b.breakdownType}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Pickup:</strong> {b.pickupAddress} ({b.distanceKm} km)
                  </p>
                  {b.assignedProviderBusinessName && (
                    <p className="text-xs text-emerald-700 font-semibold mt-2">
                      Assigned Provider: {b.assignedProviderBusinessName} ({b.assignedProviderPhone})
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Amount: </span>
                    <span className="text-base font-extrabold text-navy-900">
                      ₹{b.finalPrice || b.estimatedPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        switchTab('details');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold"
                    >
                      Open Details & Actions
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        switchTab('track');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKING DETAILS, BIDS, PAYMENT, INVOICE & REVIEW */}
      {activeTab === 'details' && (
        <div>
          {!selectedBooking ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm text-slate-500">Select a booking from My Bookings to view details.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-safety-600">
                        BOOKING ID: {selectedBooking.bookingCode}
                      </span>
                      <h2 className="text-2xl font-extrabold text-navy-900">
                        {selectedBooking.serviceCategoryName}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(selectedBooking.status)}
                      <button
                        onClick={() => switchTab('track')}
                        className="px-3.5 py-1.5 rounded-xl bg-safety-500 text-white text-xs font-bold"
                      >
                        Live Track Provider
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-400 uppercase">Vehicle Details</p>
                      <p className="text-sm font-bold text-navy-900">
                        {selectedBooking.vehicleMake} {selectedBooking.vehicleModel} ({selectedBooking.vehicleRegistration})
                      </p>
                      <p className="text-slate-600">Class: {selectedBooking.vehicleType}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-400 uppercase">Tariff Breakdown</p>
                      <p className="text-sm font-bold text-navy-900">
                        Final / Est. Total: ₹{selectedBooking.finalPrice || selectedBooking.estimatedPrice}
                      </p>
                      <p className="text-slate-600">
                        Base ₹{selectedBooking.baseFee} + ({selectedBooking.distanceKm} km × ₹{selectedBooking.ratePerKm}/km) + Addl ₹{selectedBooking.additionalCharges}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p>
                      <strong className="text-navy-900">Breakdown Symptom:</strong>{' '}
                      {selectedBooking.breakdownType}
                    </p>
                    <p>
                      <strong className="text-navy-900">Problem Description:</strong>{' '}
                      {selectedBooking.problemDescription}
                    </p>
                    <p>
                      <strong className="text-navy-900">Pickup Address:</strong>{' '}
                      {selectedBooking.pickupAddress}
                    </p>
                    {selectedBooking.destinationAddress && (
                      <p>
                        <strong className="text-navy-900">Destination:</strong>{' '}
                        {selectedBooking.destinationAddress}
                      </p>
                    )}
                    {selectedBooking.aiSuggestedCategory && (
                      <p className="text-safety-700 font-semibold">
                        Mock AI Triage Suggestion: {selectedBooking.aiSuggestedCategory} ({selectedBooking.aiConfidenceNote})
                      </p>
                    )}
                  </div>

                  {/* Provider Bids Section */}
                  {selectedBooking.bids && selectedBooking.bids.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-navy-900 mb-3">
                        Provider Bids Received ({selectedBooking.bids.length})
                      </h3>
                      <div className="space-y-2.5">
                        {selectedBooking.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-xs font-bold text-navy-900">
                                {bid.providerBusinessName} ({bid.providerRating}★)
                              </p>
                              <p className="text-xs text-slate-600">
                                Quoted: <strong>₹{bid.quotedPrice}</strong> • ETA: {bid.estimatedArrivalMinutes} mins
                              </p>
                              {bid.notes && <p className="text-[11px] text-slate-500">{bid.notes}</p>}
                            </div>
                            {!selectedBooking.assignedProviderId && bid.status === 'PENDING' ? (
                              <button
                                onClick={() => handleAcceptBid(selectedBooking.id, bid.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                              >
                                Accept Bid
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-emerald-700">{bid.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancel Eligible Booking */}
                  {['PENDING', 'BIDDING', 'ACCEPTED', 'EN_ROUTE'].includes(selectedBooking.status) && (
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Optional cancellation reason..."
                        className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                      <button
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Section (For COMPLETED bookings) */}
                {selectedBooking.status === 'COMPLETED' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-navy-900 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      Customer Service Review
                    </h3>
                    {selectedBooking.review ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <p className="text-xs font-bold text-emerald-900">
                          You rated {selectedBooking.assignedProviderBusinessName}: {selectedBooking.review.rating} / 5 ★
                        </p>
                        <p className="text-xs text-emerald-800">"{selectedBooking.review.comment}"</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-slate-700">Rating:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  reviewRating >= star
                                    ? 'bg-amber-400 text-navy-950'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {star} ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with the recovery operator..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Assigned Provider + Payment & Invoice + Dispute */}
              <div className="lg:col-span-4 space-y-6">
                {/* Assigned Provider Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                    Assigned Provider Details
                  </h3>
                  {selectedBooking.assignedProviderBusinessName ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-base font-extrabold text-navy-900">
                        {selectedBooking.assignedProviderBusinessName}
                      </p>
                      <p className="text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-safety-500" />
                        {selectedBooking.assignedProviderPhone}
                      </p>
                      <p className="text-slate-600">
                        Rating: <strong>{selectedBooking.assignedProviderRating} ★</strong> • ETA: ~{selectedBooking.estimatedArrivalMinutes} mins
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Waiting for an approved provider to accept or bid on this request.
                    </p>
                  )}
                </div>

                {/* Payment & Invoice Card */}
                <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">Payment & GST Invoice</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-safety-500 text-white">
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>

                  <p className="text-2xl font-extrabold text-safety-400">
                    ₹{selectedBooking.finalPrice || selectedBooking.estimatedPrice}
                  </p>

                  {selectedBooking.paymentStatus === 'PAID' ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                        <p className="font-bold">Payment Settled</p>
                        <p>Ref: {selectedBooking.payment?.transactionReference}</p>
                        <p>Gateway: {selectedBooking.payment?.paymentGateway}</p>
                      </div>
                      {selectedBooking.invoice && (
                        <button
                          onClick={() => setInvoiceModalBooking(selectedBooking)}
                          className="w-full py-2.5 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          View / Print Invoice ({selectedBooking.invoice.invoiceNumber})
                        </button>
                      )}
                    </div>
                  ) : selectedBooking.status !== 'CANCELLED' ? (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-300">
                        Clearly Labelled Demonstration Payment Flow (Generates PostgreSQL Payment & 18% GST Invoice immediately).
                      </div>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs text-white"
                      >
                        <option value="UPI_MOCK">Mock UPI Instant Pay (Demo)</option>
                        <option value="CARD_MOCK">Mock Credit / Debit Card (Demo)</option>
                        <option value="RAZORPAY_TEST_SIM">Razorpay Test Mode Checkout</option>
                      </select>
                      <button
                        onClick={() => handlePayBooking(selectedBooking.id)}
                        disabled={processingPayment}
                        className="w-full py-3 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-xs shadow-lg"
                      >
                        {processingPayment
                          ? 'Processing Payment...'
                          : `Pay ₹${selectedBooking.finalPrice || selectedBooking.estimatedPrice} & Generate Invoice`}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Raise Dispute / Support */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500">
                    Dispute / Support Escalation
                  </h4>
                  {selectedBooking.disputeStatus && selectedBooking.disputeStatus !== 'NONE' ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <p className="font-bold text-amber-900">
                        Dispute Status: {selectedBooking.disputeStatus}
                      </p>
                      <p className="text-slate-600">Issue: {selectedBooking.disputeReason}</p>
                      {selectedBooking.disputeResolution && (
                        <p className="text-emerald-700 font-semibold">
                          Admin Resolution: {selectedBooking.disputeResolution}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Report an issue or billing dispute..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                      <button
                        onClick={() => handleRaiseDispute(selectedBooking.id)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold"
                      >
                        Submit Complaint to Admin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TRACK PROVIDER */}
      {activeTab === 'track' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-safety-600">
                Real-Time Dispatch Telemetry
              </span>
              <h2 className="text-2xl font-extrabold text-navy-900">
                Track Assigned Roadside Provider
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedBooking?.id || ''}
                onChange={(e) => {
                  const found = bookings.find((b) => b.id === Number(e.target.value));
                  if (found) setSelectedBooking(found);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} — {b.serviceCategoryName} ({b.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBooking ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                {/* Visual GPS Dispatch Map Simulation */}
                <div className="navy-gradient rounded-3xl p-6 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between border border-navy-800">
                  <div className="flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      GPS Corridor Active
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {selectedBooking.bookingCode}
                    </span>
                  </div>

                  <div className="my-8 z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-safety-500 flex items-center justify-center shadow-lg">
                          <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">Recovery Unit</p>
                          <p className="text-sm font-bold">
                            {selectedBooking.assignedProviderBusinessName || 'Searching Nearby Fleet...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 mx-4 border-t-2 border-dashed border-safety-400 relative">
                        <Navigation className="w-5 h-5 text-safety-400 absolute -top-2.5 left-1/2 -translate-x-1/2 rotate-90" />
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs text-slate-300">Stranded Vehicle</p>
                          <p className="text-sm font-bold">{selectedBooking.vehicleRegistration}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-950/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs z-10">
                    <div>
                      <p className="text-slate-400">Pickup Location</p>
                      <p className="font-semibold text-white">{selectedBooking.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Estimated Arrival</p>
                      <p className="font-extrabold text-safety-400 text-base">
                        ~{selectedBooking.estimatedArrivalMinutes || 20} mins
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Progression Timeline */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-base font-bold text-navy-900">Live Dispatch Progression</h3>
                {[
                  { key: 'PENDING', title: '1. Request Logged in PostgreSQL', desc: 'Broadcast to nearby verified providers' },
                  { key: 'ACCEPTED', title: '2. Provider Assigned', desc: selectedBooking.assignedProviderBusinessName || 'Awaiting operator acceptance' },
                  { key: 'EN_ROUTE', title: '3. Tow Truck / Mechanic En Route', desc: 'Dispatched to your GPS coordinates' },
                  { key: 'IN_PROGRESS', title: '4. On-Site Recovery in Progress', desc: 'Vehicle inspection, jump-start, or loading' },
                  { key: 'COMPLETED', title: '5. Service Completed & Invoiced', desc: 'Ready for digital payment and review' },
                ].map((stage, idx) => {
                  const order = ['PENDING', 'BIDDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
                  const currentIdx = order.indexOf(selectedBooking.status);
                  const stageIdx = order.indexOf(stage.key);
                  const reached = currentIdx >= stageIdx && selectedBooking.status !== 'CANCELLED';
                  return (
                    <div
                      key={stage.key}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                        reached
                          ? 'bg-emerald-50/70 border-emerald-300 text-navy-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          reached ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold">{stage.title}</p>
                        <p className="text-[11px]">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No bookings available to track.</p>
          )}
        </div>
      )}

      {/* TAB 6: PAYMENT HISTORY */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-navy-900">Payment History & Tax Invoices</h2>
            <p className="text-xs text-slate-500">All settled and refunded transactions persisted in PostgreSQL</p>
          </div>
          {payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No payments recorded yet. Complete a booking payment to generate an invoice.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Transaction Ref</th>
                    <th className="py-3.5 px-4">Booking Code</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Gateway & Method</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                        {p.transactionReference}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{p.bookingCode}</td>
                      <td className="py-3.5 px-4 font-semibold">{p.serviceCategoryName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium">{p.paymentMethod}</span>
                        <span className="block text-[10px] text-slate-400">{p.paymentGateway}</span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-navy-900">₹{p.amount}</td>
                      <td className="py-3.5 px-4 font-mono text-safety-600 font-bold">
                        {p.invoiceNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy-900 mb-1">
            Customer Profile & Default Vehicle
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Changes saved here update your PostgreSQL user record and pre-fill future emergency bookings.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Address</label>
              <input
                type="text"
                value={profAddress}
                onChange={(e) => setProfAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Make</label>
                <input
                  type="text"
                  value={profMake}
                  onChange={(e) => setProfMake(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={profModel}
                  onChange={(e) => setProfModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration</label>
                <input
                  type="text"
                  value={profReg}
                  onChange={(e) => setProfReg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={profType}
                  onChange={(e) => setProfType(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="EV">EV</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-navy-900">Notifications & Dispatch Alerts</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-bold"
              >
                Mark All as Read
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  n.read ? 'bg-white border-slate-200' : 'bg-safety-50/50 border-safety-300'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-navy-900">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.createdAt}</p>
                </div>
                {!n.read && (
                  <span className="px-2 py-0.5 rounded-full bg-safety-500 text-white text-[10px] font-bold">
                    NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {invoiceModalBooking && invoiceModalBooking.invoice && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-navy-900 text-safety-500 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-900 text-lg">AutoRescue Tax Invoice</h3>
                  <p className="text-xs font-mono text-slate-500">
                    {invoiceModalBooking.invoice.invoiceNumber}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                PAID ({invoiceModalBooking.invoice.mockPayment ? 'DEMO GATEWAY' : 'RAZORPAY'})
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold">{invoiceModalBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issued To:</span>
                <span className="font-semibold">
                  {invoiceModalBooking.invoice.issuedToName} ({invoiceModalBooking.invoice.issuedToEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Provider:</span>
                <span className="font-semibold">
                  {invoiceModalBooking.invoice.providerBusinessName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Category:</span>
                <span className="font-semibold">{invoiceModalBooking.serviceCategoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span>
                  {invoiceModalBooking.vehicleMake} {invoiceModalBooking.vehicleModel} ({invoiceModalBooking.vehicleRegistration})
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-mono">₹{invoiceModalBooking.invoice.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-mono">₹{invoiceModalBooking.invoice.taxAmount}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-navy-900">
                <span>Total Paid:</span>
                <span>₹{invoiceModalBooking.invoice.totalAmount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                onClick={() => setInvoiceModalBooking(null)}
                className="px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
