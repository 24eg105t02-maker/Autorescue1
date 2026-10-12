import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  Wrench,
  CreditCard,
  AlertOctagon,
  History,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Edit3,
  Plus,
} from 'lucide-react';
import { api, extractErrorMessage } from '../services/api';
import {
  AdminAnalytics,
  AuditLogItem,
  Booking,
  PaymentItem,
  ProviderProfile,
  ServiceCategory,
  UserSummary,
} from '../types';
import { useToast } from '../hooks/useToast';

type AdminTab =
  | 'analytics'
  | 'providers'
  | 'customers'
  | 'bookings'
  | 'services'
  | 'payments'
  | 'disputes'
  | 'audit';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [customers, setCustomers] = useState<UserSummary[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [verifNoteMap, setVerifNoteMap] = useState<Record<number, string>>({});

  // Service / Pricing Edit Form
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [srvCode, setSrvCode] = useState('');
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvVehicles, setSrvVehicles] = useState('Sedan, SUV, Hatchback');
  const [srvBaseFee, setSrvBaseFee] = useState<number>(800);
  const [srvRateKm, setSrvRateKm] = useState<number>(35);
  const [srvAddl, setSrvAddl] = useState<number>(100);
  const [srvEta, setSrvEta] = useState<number>(20);
  const [srvActive, setSrvActive] = useState<boolean>(true);

  // Dispute resolution map
  const [disputeNoteMap, setDisputeNoteMap] = useState<Record<number, string>>({});

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [anaRes, custRes, provRes, bookRes, srvRes, payRes, audRes] = await Promise.all([
        api.get<AdminAnalytics>('/admin/analytics'),
        api.get<UserSummary[]>('/admin/customers'),
        api.get<ProviderProfile[]>('/admin/providers'),
        api.get<Booking[]>('/admin/bookings'),
        api.get<ServiceCategory[]>('/admin/services'),
        api.get<PaymentItem[]>('/admin/payments'),
        api.get<AuditLogItem[]>('/admin/audit-logs'),
      ]);
      setAnalytics(anaRes.data);
      setCustomers(custRes.data);
      setProviders(provRes.data);
      setBookings(bookRes.data);
      setServices(srvRes.data);
      setPayments(payRes.data);
      setAuditLogs(audRes.data);
    } catch (err) {
      showToast('error', 'Failed to load Admin Command Center', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleVerifyProvider = async (
    providerId: number,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  ) => {
    try {
      const notes =
        verifNoteMap[providerId] ||
        `Verification status set to ${status} by Platform Administrator.`;
      const res = await api.patch<ProviderProfile>(
        `/admin/providers/${providerId}/verification`,
        { status, notes }
      );
      showToast(
        'success',
        `Provider ${res.data.businessName}: ${res.data.verificationStatus}`,
        notes
      );
      await loadAdminData();
    } catch (err) {
      showToast('error', 'Verification Update Failed', extractErrorMessage(err));
    }
  };

  const handleToggleCustomerActive = async (customerId: number) => {
    try {
      const res = await api.patch<UserSummary>(
        `/admin/customers/${customerId}/toggle-active`
      );
      showToast(
        'info',
        `Customer ${res.data.fullName}`,
        `Account status is now ${res.data.active ? 'ACTIVE' : 'SUSPENDED'}.`
      );
      await loadAdminData();
    } catch (err) {
      showToast('error', 'Update Failed', extractErrorMessage(err));
    }
  };

  const handleSelectServiceForEdit = (s: ServiceCategory) => {
    setEditingServiceId(s.id);
    setSrvCode(s.code);
    setSrvName(s.name);
    setSrvDesc(s.description);
    setSrvVehicles(s.supportedVehicleTypes);
    setSrvBaseFee(Number(s.baseFee));
    setSrvRateKm(Number(s.ratePerKm));
    setSrvAddl(Number(s.additionalCharges));
    setSrvEta(s.estimatedEtaMinutes);
    setSrvActive(s.active);
  };

  const handleSaveServicePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: srvCode,
        name: srvName,
        description: srvDesc,
        supportedVehicleTypes: srvVehicles,
        baseFee: srvBaseFee,
        ratePerKm: srvRateKm,
        additionalCharges: srvAddl,
        estimatedEtaMinutes: srvEta,
        active: srvActive,
        iconName: 'Truck',
      };
      if (editingServiceId) {
        await api.put(`/admin/services/${editingServiceId}`, payload);
        showToast('success', 'Service & Pricing Rule Updated', `Updated tariff for ${srvName}`);
      } else {
        await api.post('/admin/services', payload);
        showToast('success', 'New Service Category Created', `Added ${srvName} to catalog`);
      }
      setEditingServiceId(null);
      setSrvCode('');
      setSrvName('');
      setSrvDesc('');
      await loadAdminData();
    } catch (err) {
      showToast('error', 'Save Failed', extractErrorMessage(err));
    }
  };

  const handleRefundPayment = async (paymentId: number) => {
    try {
      const res = await api.post<PaymentItem>(`/admin/payments/${paymentId}/refund`);
      showToast(
        'info',
        `Refund Issued: ₹${res.data.amount}`,
        `Transaction ${res.data.transactionReference} marked REFUNDED.`
      );
      await loadAdminData();
    } catch (err) {
      showToast('error', 'Refund Failed', extractErrorMessage(err));
    }
  };

  const handleResolveDispute = async (bookingId: number, status: 'RESOLVED' | 'REFUNDED') => {
    try {
      const resolution =
        disputeNoteMap[bookingId] ||
        `Reviewed by Admin and marked ${status}.`;
      await api.patch(`/admin/bookings/${bookingId}/dispute`, {
        disputeStatus: status,
        resolution,
      });
      showToast('success', `Dispute ${status}`, resolution);
      await loadAdminData();
    } catch (err) {
      showToast('error', 'Dispute Update Error', extractErrorMessage(err));
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const filteredProviders = providers.filter(
    (p) =>
      p.businessName.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.verificationStatus.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.serviceCategoryName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.status.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const disputedBookings = bookings.filter(
    (b) => b.disputeStatus && b.disputeStatus !== 'NONE'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Command Banner */}
      <div className="navy-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-safety-400">
            Secured Backend Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            AutoRescue Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Monitor live KPIs, verify providers, manage 10 service tariffs, process refunds, and audit platform operations.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Live Metrics
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-6 border-b border-slate-200">
        {[
          { id: 'analytics', label: 'KPIs & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
          {
            id: 'providers',
            label: `Providers & Verification (${analytics?.pendingVerifications || 0} Pending)`,
            icon: <ShieldCheck className="w-4 h-4" />,
          },
          { id: 'customers', label: `Customers (${customers.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'bookings', label: `All Bookings (${bookings.length})`, icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'services', label: `Services & Pricing (${services.length})`, icon: <Wrench className="w-4 h-4" /> },
          { id: 'payments', label: `Payments & Refunds (${payments.length})`, icon: <CreditCard className="w-4 h-4" /> },
          { id: 'disputes', label: `Complaints & Disputes (${disputedBookings.length})`, icon: <AlertOctagon className="w-4 h-4" /> },
          { id: 'audit', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as AdminTab)}
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

      {/* TAB 1: ANALYTICS & KPI SUMMARY */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-slate-400">Total Customers</p>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">
                {analytics.totalCustomers}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-slate-400">Total Providers</p>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">
                {analytics.totalProviders}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-amber-700">
                Pending Verifications
              </p>
              <p className="text-2xl font-extrabold text-amber-800 mt-1">
                {analytics.pendingVerifications}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-safety-600">Active Bookings</p>
              <p className="text-2xl font-extrabold text-safety-600 mt-1">
                {analytics.activeBookings}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-emerald-600">
                Completed Bookings
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {analytics.completedBookings}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase text-rose-600">
                Cancelled Bookings
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {analytics.cancelledBookings}
              </p>
            </div>
            <div className="bg-navy-900 text-white p-4 rounded-2xl shadow-md">
              <p className="text-[11px] font-bold uppercase text-safety-400">Revenue Summary</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                ₹{analytics.totalRevenue}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-navy-900 mb-4">
                Bookings Distribution by Roadside Category
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.bookingsByCategory).map(([cat, count]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-navy-900">{cat}</span>
                      <span className="text-safety-600 font-bold">{count} bookings</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-safety-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (count / Math.max(1, bookings.length)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-navy-900">
                  Provider Verification Queue
                </h3>
                <button
                  onClick={() => setActiveTab('providers')}
                  className="text-xs font-bold text-safety-600 hover:underline"
                >
                  Manage All Providers →
                </button>
              </div>
              <div className="space-y-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-navy-900">{p.businessName}</p>
                      <p className="text-[11px] text-slate-500">
                        Owner: {p.ownerName} • License: {p.licenseNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                      {p.verificationStatus === 'PENDING' && (
                        <button
                          onClick={() => handleVerifyProvider(p.id, 'APPROVED')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDERS & VERIFICATION */}
      {activeTab === 'providers' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-navy-900">
              Manage Providers & Approve Verifications ({filteredProviders.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                placeholder="Search business, city, status..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredProviders.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-extrabold text-navy-900">{p.businessName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          p.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Owner: <strong>{p.ownerName}</strong> ({p.email} • {p.phone}) • License:{' '}
                      <span className="font-mono font-bold">{p.licenseNumber}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Area: {p.serviceArea}, {p.city} • Supported: {p.supportedCategories}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-navy-900">
                      Completed Jobs: {p.totalCompletedJobs} • Earnings: ₹{p.totalEarnings}
                    </p>
                    <p className="text-slate-500">
                      Vehicles: {p.vehicles.length} • Docs: {p.documents.length}
                    </p>
                  </div>
                </div>

                {p.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.documents.map((d) => (
                      <a
                        key={d.id}
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-navy-900"
                      >
                        📄 {d.documentType} ({d.documentNumber})
                      </a>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={verifNoteMap[p.id] ?? (p.verificationNotes || '')}
                    onChange={(e) =>
                      setVerifNoteMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    placeholder="Admin verification review notes..."
                    className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleVerifyProvider(p.id, 'APPROVED')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyProvider(p.id, 'REJECTED')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerifyProvider(p.id, 'SUSPENDED')}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy-900">
              Registered Customers ({filteredCustomers.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer name, email, phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Email & Phone</th>
                  <th className="py-3.5 px-4">Default Vehicle</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3.5 px-4 font-mono">#{c.id}</td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">{c.fullName}</td>
                    <td className="py-3.5 px-4">
                      {c.email} • {c.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.defaultVehicleMake} {c.defaultVehicleModel} ({c.defaultVehicleRegistration})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          c.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleCustomerActive(c.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold"
                      >
                        {c.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy-900">
              All Platform Bookings ({filteredBookings.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search Booking ID, customer, service..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service & Vehicle</th>
                  <th className="py-3.5 px-4">Assigned Provider</th>
                  <th className="py-3.5 px-4">Price & Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {b.bookingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold">{b.customerName}</p>
                      <p className="text-slate-500">{b.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy-900">{b.serviceCategoryName}</p>
                      <p className="text-slate-500">
                        {b.vehicleMake} {b.vehicleModel} ({b.vehicleRegistration})
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.assignedProviderBusinessName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold">₹{b.finalPrice || b.estimatedPrice}</span> •{' '}
                      <span className="font-semibold text-emerald-700">{b.paymentStatus}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MANAGE SERVICE CATEGORIES & ESTIMATED PRICING */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-navy-900 mb-4 flex items-center gap-2">
              {editingServiceId ? (
                <>
                  <Edit3 className="w-5 h-5 text-safety-500" />
                  Edit Service Tariff (#{editingServiceId})
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-safety-500" />
                  Create Roadside Service Category
                </>
              )}
            </h3>

            <form onSubmit={handleSaveServicePricing} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={srvCode}
                    onChange={(e) => setSrvCode(e.target.value)}
                    placeholder="FLATBED_TOWING"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    placeholder="Flatbed Towing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supported Vehicle Types *
                </label>
                <input
                  type="text"
                  required
                  value={srvVehicles}
                  onChange={(e) => setSrvVehicles(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={srvBaseFee}
                    onChange={(e) => setSrvBaseFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate / Km (₹)</label>
                  <input
                    type="number"
                    required
                    value={srvRateKm}
                    onChange={(e) => setSrvRateKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Addl Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={srvAddl}
                    onChange={(e) => setSrvAddl(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold"
                >
                  {editingServiceId ? 'Update Pricing in PostgreSQL' : 'Create Service Category'}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => setEditingServiceId(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-lg font-extrabold text-navy-900">
              Configured Service Categories & Pricing Rules ({services.length})
            </h3>
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-navy-900">
                    {s.name} <span className="text-xs font-mono text-slate-400">({s.code})</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Base: <strong>₹{s.baseFee}</strong> + <strong>₹{s.ratePerKm}/km</strong> + Addl:{' '}
                    <strong>₹{s.additionalCharges}</strong> • ETA ~{s.estimatedEtaMinutes}m
                  </p>
                </div>
                <button
                  onClick={() => handleSelectServiceForEdit(s)}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-bold"
                >
                  Edit Tariff
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS & REFUNDS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-navy-900">
              Platform Payments & Refund Controls ({payments.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Invoice</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3.5 px-4 font-mono font-bold">{p.transactionReference}</td>
                    <td className="py-3.5 px-4 font-mono">{p.bookingCode}</td>
                    <td className="py-3.5 px-4">{p.paymentGateway}</td>
                    <td className="py-3.5 px-4 font-extrabold">₹{p.amount}</td>
                    <td className="py-3.5 px-4 font-mono text-safety-600">{p.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{p.status}</td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status !== 'REFUNDED' && (
                        <button
                          onClick={() => handleRefundPayment(p.id)}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                        >
                          Issue Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: COMPLAINTS & DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-navy-900">
            Customer Complaints & Dispute Resolution ({disputedBookings.length})
          </h2>
          {disputedBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No active complaints or disputes reported.
            </div>
          ) : (
            disputedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-navy-900">
                    {b.bookingCode} — {b.customerName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {b.disputeStatus}
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-semibold">
                  Complaint: "{b.disputeReason}"
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={disputeNoteMap[b.id] || ''}
                    onChange={(e) =>
                      setDisputeNoteMap((prev) => ({ ...prev, [b.id]: e.target.value }))
                    }
                    placeholder="Enter resolution notes..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    onClick={() => handleResolveDispute(b.id, 'RESOLVED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleResolveDispute(b.id, 'REFUNDED')}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Resolve & Refund
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-navy-900">
              Platform Security & Operational Audit Trail ({auditLogs.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.createdAt}
                    </td>
                    <td className="py-3 px-4 font-semibold">{log.actorEmail}</td>
                    <td className="py-3 px-4 font-bold text-safety-600">{log.actorRole}</td>
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">{log.action}</td>
                    <td className="py-3 px-4">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
