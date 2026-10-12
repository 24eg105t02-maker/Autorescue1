import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  Truck,
  FileCheck,
  Briefcase,
  Activity,
  DollarSign,
  Star,
  Power,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Send,
} from 'lucide-react';
import { api, extractErrorMessage } from '../services/api';
import { Booking, ProviderProfile, ReviewItem } from '../types';
import { useToast } from '../hooks/useToast';

type ProviderTab =
  | 'overview'
  | 'available'
  | 'active'
  | 'business'
  | 'vehicles'
  | 'documents'
  | 'earnings'
  | 'reviews'
  | 'availability';

export const ProviderDashboard: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProviderTab>('overview');
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Business Profile Form
  const [businessName, setBusinessName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [city, setCity] = useState('');
  const [supportedCategories, setSupportedCategories] = useState('');

  // Vehicle Form
  const [vehType, setVehType] = useState('Hydraulic Flatbed Carrier');
  const [vehMakeModel, setVehMakeModel] = useState('');
  const [vehReg, setVehReg] = useState('');
  const [vehCap, setVehCap] = useState(3.5);
  const [vehEquip, setVehEquip] = useState('');

  // Document Form
  const [docType, setDocType] = useState('Commercial Towing & Recovery Permit');
  const [docNumber, setDocNumber] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Bid Form
  const [bidJobId, setBidJobId] = useState<number | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(1200);
  const [bidEta, setBidEta] = useState<number>(20);
  const [bidNotes, setBidNotes] = useState('');

  const loadProviderData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, jobsRes, revRes] = await Promise.all([
        api.get<ProviderProfile>('/providers/me'),
        api.get<Booking[]>('/providers/jobs'),
        api.get<ReviewItem[]>('/providers/reviews'),
      ]);
      const p = profRes.data;
      setProfile(p);
      setBusinessName(p.businessName);
      setLicenseNumber(p.licenseNumber);
      setServiceArea(p.serviceArea);
      setCity(p.city);
      setSupportedCategories(p.supportedCategories);
      setJobs(jobsRes.data);
      setReviews(revRes.data);
    } catch (err) {
      showToast('error', 'Failed to load provider portal', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const res = await api.patch<ProviderProfile>('/providers/availability', {
        available: !profile.available,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      setProfile(res.data);
      showToast(
        'success',
        `Dispatch Status: ${res.data.available ? 'ONLINE' : 'OFFLINE'}`,
        res.data.available
          ? 'You are now visible for incoming emergency roadside requests.'
          : 'You are now offline.'
      );
    } catch (err) {
      showToast('error', 'Could not update availability', extractErrorMessage(err));
    }
  };

  const handleAcceptJob = async (bookingId: number) => {
    try {
      const res = await api.post<Booking>(`/providers/jobs/${bookingId}/accept`);
      showToast(
        'success',
        `Job Accepted: ${res.data.bookingCode}`,
        'Proceed to Active Jobs to update EN_ROUTE / IN_PROGRESS / COMPLETED status.'
      );
      await loadProviderData();
      setActiveTab('active');
    } catch (err) {
      showToast('error', 'Cannot Accept Job', extractErrorMessage(err));
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidJobId) return;
    try {
      await api.post(`/providers/jobs/${bidJobId}/bids`, {
        quotedPrice: bidPrice,
        estimatedArrivalMinutes: bidEta,
        notes: bidNotes,
      });
      showToast('success', 'Bid Submitted!', 'Customer has been notified of your price & ETA quote.');
      setBidJobId(null);
      setBidNotes('');
      await loadProviderData();
    } catch (err) {
      showToast('error', 'Bid Submission Failed', extractErrorMessage(err));
    }
  };

  const handleUpdateJobStatus = async (bookingId: number, status: string) => {
    try {
      const res = await api.patch<Booking>(`/providers/jobs/${bookingId}/status`, { status });
      showToast(
        'success',
        `Job ${res.data.bookingCode} Updated to ${status}`,
        status === 'COMPLETED'
          ? 'Job marked COMPLETED! Customer can now settle payment and submit a review.'
          : 'Customer notified of live dispatch progress.'
      );
      await loadProviderData();
    } catch (err) {
      showToast('error', 'Status Update Error', extractErrorMessage(err));
    }
  };

  const handleUpdateBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<ProviderProfile>('/providers/register', {
        businessName,
        licenseNumber,
        serviceArea,
        city,
        supportedCategories,
      });
      setProfile(res.data);
      showToast('success', 'Business Profile Saved', 'Your provider registration details are updated in PostgreSQL.');
    } catch (err) {
      showToast('error', 'Profile Update Failed', extractErrorMessage(err));
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/providers/vehicles', {
        vehicleType: vehType,
        makeModel: vehMakeModel,
        registrationNumber: vehReg,
        capacityTons: vehCap,
        equipmentDetails: vehEquip,
      });
      showToast('success', 'Vehicle Added to Fleet', `${vehMakeModel} (${vehReg}) registered.`);
      setVehMakeModel('');
      setVehReg('');
      setVehEquip('');
      await loadProviderData();
    } catch (err) {
      showToast('error', 'Failed to add vehicle', extractErrorMessage(err));
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      await api.delete(`/providers/vehicles/${vehicleId}`);
      showToast('info', 'Vehicle Removed', 'Fleet vehicle deleted.');
      await loadProviderData();
    } catch (err) {
      showToast('error', 'Delete Error', extractErrorMessage(err));
    }
  };

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ fileUrl: string }>('/services/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocUrl(res.data.fileUrl);
      showToast('success', 'Document File Uploaded', 'Click Submit Document to attach to your verification profile.');
    } catch (err) {
      showToast('error', 'File Upload Failed', extractErrorMessage(err));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/providers/documents', {
        documentType: docType,
        documentNumber: docNumber,
        fileUrl: docUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      });
      showToast('success', 'Verification Document Submitted', 'Sent to Admin Verification Queue.');
      setDocNumber('');
      setDocUrl('');
      await loadProviderData();
    } catch (err) {
      showToast('error', 'Document Submission Error', extractErrorMessage(err));
    }
  };

  const openJobs = jobs.filter(
    (j) => !j.assignedProviderId && (j.status === 'PENDING' || j.status === 'BIDDING')
  );
  const myActiveJobs = jobs.filter(
    (j) =>
      j.assignedProviderId === profile?.id &&
      ['ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(j.status)
  );
  const myCompletedJobs = jobs.filter(
    (j) => j.assignedProviderId === profile?.id && j.status === 'COMPLETED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Provider Dispatch Header */}
      <div className="navy-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-safety-400">
              Provider Dispatch Command
            </span>
            {profile && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  profile.verificationStatus === 'APPROVED'
                    ? 'bg-emerald-500 text-navy-950'
                    : profile.verificationStatus === 'PENDING'
                    ? 'bg-amber-400 text-navy-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                VERIFICATION: {profile.verificationStatus}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {profile?.businessName || 'Provider Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            License: {profile?.licenseNumber} • Coverage: {profile?.serviceArea} ({profile?.city})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {profile && (
            <button
              onClick={handleToggleAvailability}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition ${
                profile.available
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-navy-950'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {profile.available ? 'ONLINE (Receiving Jobs)' : 'OFFLINE (Click to Go Online)'}
            </button>
          )}
          <button
            onClick={loadProviderData}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold border border-navy-600"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Unapproved Provider Notice */}
      {profile && profile.verificationStatus !== 'APPROVED' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">
              Provider Verification Status: {profile.verificationStatus}
            </p>
            <p>
              Per platform security rules, only <strong>APPROVED</strong> providers may accept production jobs or submit bids. Upload your verification documents and an Admin can approve your account in the Admin Command Center.
            </p>
          </div>
        </div>
      )}

      {/* Provider Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-6 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'available', label: `Available Jobs (${openJobs.length})`, icon: <Briefcase className="w-4 h-4" /> },
          { id: 'active', label: `Active Jobs (${myActiveJobs.length})`, icon: <Activity className="w-4 h-4" /> },
          { id: 'business', label: 'Business Profile', icon: <Building2 className="w-4 h-4" /> },
          { id: 'vehicles', label: `Fleet Vehicles (${profile?.vehicles.length || 0})`, icon: <Truck className="w-4 h-4" /> },
          { id: 'documents', label: `Verification Docs (${profile?.documents.length || 0})`, icon: <FileCheck className="w-4 h-4" /> },
          { id: 'earnings', label: 'Earnings & History', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: <Star className="w-4 h-4" /> },
          { id: 'availability', label: 'Availability Settings', icon: <Power className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as ProviderTab)}
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
      {activeTab === 'overview' && profile && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">Open Nearby Requests</p>
              <p className="text-3xl font-extrabold text-safety-600 mt-2">{openJobs.length}</p>
              <button
                onClick={() => setActiveTab('available')}
                className="text-xs font-bold text-navy-900 hover:underline mt-1"
              >
                Inspect Available Jobs →
              </button>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-indigo-600">My Active Dispatches</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-2">{myActiveJobs.length}</p>
              <p className="text-xs text-slate-500 mt-1">In progress right now</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-600">Total Earnings</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                ₹{profile.totalEarnings}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {profile.totalCompletedJobs} Completed Rescues
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase text-amber-600">Provider Rating</p>
              <p className="text-3xl font-extrabold text-navy-900 mt-2">
                {profile.ratingAverage} ★
              </p>
              <p className="text-xs text-slate-500 mt-1">{profile.totalReviews} Verified Reviews</p>
            </div>
          </div>

          {/* Quick Active & Available Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-navy-900 mb-4">
                Incoming Roadside Requests ({openJobs.length})
              </h3>
              {openJobs.length === 0 ? (
                <p className="text-xs text-slate-500">No open requests waiting right now.</p>
              ) : (
                <div className="space-y-3">
                  {openJobs.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-safety-600">
                          {j.bookingCode}
                        </span>
                        <p className="text-sm font-bold text-navy-900">{j.serviceCategoryName}</p>
                        <p className="text-xs text-slate-600">
                          {j.pickupAddress} ({j.distanceKm} km) • Est. ₹{j.estimatedPrice}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptJob(j.id)}
                        className="px-4 py-2 rounded-xl bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold shrink-0"
                      >
                        Accept Job
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-navy-900 mb-4">
                My Active Dispatches ({myActiveJobs.length})
              </h3>
              {myActiveJobs.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No active jobs currently assigned. Accept a request from Available Jobs!
                </p>
              ) : (
                <div className="space-y-3">
                  {myActiveJobs.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-900">
                          {j.bookingCode} — {j.serviceCategoryName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {j.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Customer: <strong>{j.customerName}</strong> ({j.customerPhone}) • {j.pickupAddress}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateJobStatus(j.id, 'EN_ROUTE')}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-bold"
                        >
                          Mark EN_ROUTE
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(j.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
                        >
                          Mark IN_PROGRESS
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(j.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Mark COMPLETED
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABLE JOBS & SUBMIT BID */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-navy-900">
            Available Service Requests ({openJobs.length})
          </h2>

          {openJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              No unassigned service requests at this moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-900 text-safety-400">
                        {job.bookingCode}
                      </span>
                      <span className="text-base font-extrabold text-navy-900">
                        Est. ₹{job.estimatedPrice}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{job.serviceCategoryName}</h3>
                    <p className="text-xs text-slate-600">
                      <strong>Vehicle:</strong> {job.vehicleMake} {job.vehicleModel} ({job.vehicleRegistration}) — {job.vehicleType}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>Problem:</strong> {job.breakdownType} — {job.problemDescription}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>Pickup:</strong> {job.pickupAddress} ({job.distanceKm} km)
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-xs shadow-sm"
                      >
                        Accept Immediately (₹{job.estimatedPrice})
                      </button>
                      <button
                        onClick={() => {
                          setBidJobId(job.id);
                          setBidPrice(Number(job.estimatedPrice));
                        }}
                        className="py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs"
                      >
                        Submit Custom Bid
                      </button>
                    </div>

                    {bidJobId === job.id && (
                      <form
                        onSubmit={handleSubmitBid}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                      >
                        <p className="text-xs font-bold text-navy-900">
                          Submit Price Quote & ETA for {job.bookingCode}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Quoted Price (₹)
                            </label>
                            <input
                              type="number"
                              required
                              min={100}
                              value={bidPrice}
                              onChange={(e) => setBidPrice(Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              ETA (Minutes)
                            </label>
                            <input
                              type="number"
                              required
                              min={5}
                              value={bidEta}
                              onChange={(e) => setBidEta(Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={bidNotes}
                          onChange={(e) => setBidNotes(e.target.value)}
                          placeholder="Notes (e.g. Hydraulic flatbed ready 3km away)"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Bid
                          </button>
                          <button
                            type="button"
                            onClick={() => setBidJobId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE JOBS & STATUS PROGRESSION */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-navy-900">
            Active Dispatches & Job Status Control ({myActiveJobs.length})
          </h2>
          {myActiveJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              You have no active dispatches right now. Accept an open request from the Available Jobs tab.
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-mono text-xs font-bold text-safety-600">
                        {job.bookingCode}
                      </span>
                      <h3 className="text-xl font-extrabold text-navy-900">
                        {job.serviceCategoryName} — {job.vehicleMake} {job.vehicleModel} ({job.vehicleRegistration})
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                      CURRENT STATUS: {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase">Customer Contact</p>
                      <p className="font-bold text-navy-900 text-sm">{job.customerName}</p>
                      <p className="text-slate-600">{job.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase">Pickup Location</p>
                      <p className="font-semibold text-navy-900">{job.pickupAddress}</p>
                      <p className="text-slate-500">Distance: {job.distanceKm} km</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase">Agreed Payout</p>
                      <p className="text-lg font-extrabold text-emerald-600">
                        ₹{job.finalPrice || job.estimatedPrice}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Update Live Job Status:</span>
                    <button
                      onClick={() => handleUpdateJobStatus(job.id, 'EN_ROUTE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        job.status === 'EN_ROUTE'
                          ? 'bg-safety-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-navy-900'
                      }`}
                    >
                      1. Mark EN_ROUTE
                    </button>
                    <button
                      onClick={() => handleUpdateJobStatus(job.id, 'IN_PROGRESS')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        job.status === 'IN_PROGRESS'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-navy-900'
                      }`}
                    >
                      2. Mark IN_PROGRESS
                    </button>
                    <button
                      onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      3. Complete Rescue Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BUSINESS PROFILE */}
      {activeTab === 'business' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-navy-900 mb-1">
            Provider Business Registration & Profile
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Maintain accurate business and coverage corridor details for emergency dispatch routing.
          </p>

          <form onSubmit={handleUpdateBusinessProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trade / RTO Towing License # *
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Coverage Area *
                </label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supported Roadside Categories *
              </label>
              <textarea
                rows={2}
                required
                value={supportedCategories}
                onChange={(e) => setSupportedCategories(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold"
            >
              Save Business Profile
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: VEHICLE MANAGEMENT */}
      {activeTab === 'vehicles' && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-navy-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-safety-500" />
              Add Recovery / Towing Vehicle
            </h3>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={vehType}
                  onChange={(e) => setVehType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Hydraulic Flatbed Carrier">Hydraulic Flatbed Carrier</option>
                  <option value="Under-Lift Wheel Tow Truck">Under-Lift Wheel Tow Truck</option>
                  <option value="Heavy Duty Rotator Winch">Heavy Duty Rotator Winch</option>
                  <option value="Two-Wheeler Carrier Van">Two-Wheeler Carrier Van</option>
                  <option value="Mobile EV & Battery Patrol Van">Mobile EV & Battery Patrol Van</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chassis Make & Model *
                </label>
                <input
                  type="text"
                  required
                  value={vehMakeModel}
                  onChange={(e) => setVehMakeModel(e.target.value)}
                  placeholder="Eicher Pro 2095XP Flatbed"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration # *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehReg}
                    onChange={(e) => setVehReg(e.target.value)}
                    placeholder="KA-01-TR-5501"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacity (Tons)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={vehCap}
                    onChange={(e) => setVehCap(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Onboard Equipment Details
                </label>
                <input
                  type="text"
                  value={vehEquip}
                  onChange={(e) => setVehEquip(e.target.value)}
                  placeholder="5T Hydraulic Winch, Wheel Skates, 24V Jump Pack"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold"
              >
                Register Vehicle to Fleet
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-extrabold text-navy-900">
              Registered Fleet Vehicles ({profile.vehicles.length})
            </h3>
            {profile.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-safety-400">
                    {v.registrationNumber}
                  </span>
                  <h4 className="font-bold text-navy-900 text-sm mt-1">
                    {v.makeModel} — {v.vehicleType} ({v.capacityTons}T)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{v.equipmentDetails}</p>
                </div>
                <button
                  onClick={() => handleDeleteVehicle(v.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: VERIFICATION DOCUMENTS */}
      {activeTab === 'documents' && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-navy-900 mb-4">
              Upload Verification Document
            </h3>
            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Commercial Towing & Recovery Permit">Commercial Towing & Recovery Permit</option>
                  <option value="GST / Trade Registration Certificate">GST / Trade Registration Certificate</option>
                  <option value="Fleet Comprehensive Insurance Policy">Fleet Comprehensive Insurance Policy</option>
                  <option value="Operator Heavy Vehicle Driving License">Operator Heavy Vehicle Driving License</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / Certificate Number *
                </label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="RTO-KA-TOW-2026-991"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload File (JPG/PNG/PDF)
                </label>
                <label className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-navy-400 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-navy-900">
                  <Upload className="w-4 h-4 text-safety-500" />
                  <span>{uploadingDoc ? 'Uploading...' : docUrl ? 'File Ready ✓' : 'Choose Document File'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleDocFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold"
              >
                Submit Document for Admin Verification
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-extrabold text-navy-900">
              Submitted Compliance Documents ({profile.documents.length})
            </h3>
            {profile.documents.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-navy-900">{d.documentType}</p>
                  <p className="text-xs font-mono text-slate-500">Number: {d.documentNumber}</p>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-safety-600 font-bold hover:underline mt-1 inline-block"
                  >
                    View Uploaded Document →
                  </a>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    d.verificationStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: EARNINGS & COMPLETED HISTORY */}
      {activeTab === 'earnings' && profile && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Cumulative Settled Earnings</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                ₹{profile.totalEarnings}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Completed Jobs</p>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">
                {profile.totalCompletedJobs}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-navy-900">Completed Job Ledger</h3>
            </div>
            {myCompletedJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No completed jobs yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payout Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myCompletedJobs.map((j) => (
                    <tr key={j.id}>
                      <td className="py-3.5 px-4 font-mono font-bold">{j.bookingCode}</td>
                      <td className="py-3.5 px-4 font-semibold">{j.serviceCategoryName}</td>
                      <td className="py-3.5 px-4">{j.customerName}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                        ₹{j.finalPrice || j.estimatedPrice}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {j.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-navy-900">
            Customer Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No reviews submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">{r.customerName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                      {r.rating} ★
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                  <p className="text-[11px] text-slate-400">
                    Booking {r.bookingCode} • {r.serviceCategoryName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: AVAILABILITY SETTINGS */}
      {activeTab === 'availability' && profile && (
        <div className="max-w-xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-extrabold text-navy-900">
            Real-Time Dispatch Availability Settings
          </h2>
          <p className="text-xs text-slate-600">
            Toggle your dispatch status to control whether you receive new emergency job alerts.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-navy-900">
                Current Status: {profile.available ? 'ONLINE' : 'OFFLINE'}
              </p>
              <p className="text-xs text-slate-500">
                GPS Base Coordinates: {profile.latitude}, {profile.longitude}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                profile.available
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {profile.available ? 'Go Offline' : 'Go Online Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
