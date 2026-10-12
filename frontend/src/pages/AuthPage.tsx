import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  Car,
  ArrowRight,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { api, extractErrorMessage } from '../services/api';
import { AuthResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';
  const redirectParam = searchParams.get('redirect');

  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [defaultVehicleMake, setDefaultVehicleMake] = useState('Hyundai');
  const [defaultVehicleModel, setDefaultVehicleModel] = useState('Creta');
  const [defaultVehicleRegistration, setDefaultVehicleRegistration] = useState('KA-01-AB-1234');
  const [defaultVehicleType, setDefaultVehicleType] = useState('SUV');

  // Provider registration fields
  const [businessName, setBusinessName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('NH-44 & Outer Ring Road');
  const [city, setCity] = useState('Bengaluru');
  const [supportedCategories, setSupportedCategories] = useState(
    'Flatbed Towing, Breakdown Towing, Battery Jump-Start, Flat-Tyre Assistance'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { setSessionData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const navigateAfterAuth = (auth: AuthResponse) => {
    if (redirectParam && auth.user.role === 'CUSTOMER') {
      navigate(redirectParam);
      return;
    }
    if (auth.user.role === 'ADMIN') navigate('/admin');
    else if (auth.user.role === 'PROVIDER') navigate('/provider');
    else navigate('/customer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await api.post<AuthResponse>('/auth/login', { email, password });
        setSessionData(res.data);
        showToast('success', `Welcome back, ${res.data.user.fullName}!`, `Logged in as ${res.data.user.role}`);
        navigateAfterAuth(res.data);
      } else {
        const payload = {
          fullName,
          email,
          phone,
          password,
          role,
          address,
          defaultVehicleMake: role === 'CUSTOMER' ? defaultVehicleMake : undefined,
          defaultVehicleModel: role === 'CUSTOMER' ? defaultVehicleModel : undefined,
          defaultVehicleRegistration: role === 'CUSTOMER' ? defaultVehicleRegistration : undefined,
          defaultVehicleType: role === 'CUSTOMER' ? defaultVehicleType : undefined,
          businessName: role === 'PROVIDER' ? businessName : undefined,
          licenseNumber: role === 'PROVIDER' ? licenseNumber : undefined,
          serviceArea: role === 'PROVIDER' ? serviceArea : undefined,
          city: role === 'PROVIDER' ? city : undefined,
          supportedCategories: role === 'PROVIDER' ? supportedCategories : undefined,
        };
        const res = await api.post<AuthResponse>('/auth/register', payload);
        setSessionData(res.data);
        showToast('success', 'Account Created Successfully!', `Signed in as ${res.data.user.role}`);
        navigateAfterAuth(res.data);
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Authentication failed. Please check your inputs.');
      setErrorMsg(msg);
      showToast('error', 'Authentication Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', {
        email: demoEmail,
        password: demoPass,
      });
      setSessionData(res.data);
      showToast('success', `Signed in as ${res.data.user.fullName}`, `Role: ${res.data.user.role}`);
      navigateAfterAuth(res.data);
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Info Panel */}
        <div className="lg:col-span-5 navy-gradient text-white p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety-500/20 text-safety-400 text-xs font-bold mb-6">
              <ShieldAlert className="w-4 h-4" />
              BCrypt + JWT Protected Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
              {mode === 'login'
                ? 'Sign In to Your AutoRescue Command Portal'
                : 'Create Your AutoRescue Account'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Role-based dashboards for Vehicle Owners (Customers), Towing & Mechanic Partners (Providers), and Platform Administrators.
            </p>

            {/* Quick Demo Credentials Box */}
            <div className="bg-navy-900/90 border border-navy-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-safety-400">
                <KeyRound className="w-4 h-4" />
                1-Click Verified Demo Accounts
              </div>
              <p className="text-xs text-slate-400">
                Click any button below to sign in immediately with pre-seeded PostgreSQL accounts:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer@autorescue.com', 'Customer@123')}
                  className="text-left px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Customer Account</p>
                    <p className="text-[11px] text-slate-400">customer@autorescue.com</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    CUSTOMER
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('provider@autorescue.com', 'Provider@123')}
                  className="text-left px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Approved Provider</p>
                    <p className="text-[11px] text-slate-400">provider@autorescue.com</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-safety-500/20 text-safety-300">
                    APPROVED
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('pending.provider@autorescue.com', 'Provider@123')}
                  className="text-left px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Pending Provider</p>
                    <p className="text-[11px] text-slate-400">pending.provider@autorescue.com</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    PENDING
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@autorescue.com', 'Admin@123')}
                  className="text-left px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Platform Admin</p>
                    <p className="text-[11px] text-slate-400">admin@autorescue.com</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    ADMIN
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            Admin privileges are strictly enforced on the backend. Frontend requests cannot self-assign ADMIN roles.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-extrabold text-navy-900">
                {mode === 'login' ? 'Sign In' : 'Register New Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Enter your registered email and password below.'
                  : 'Complete the form below to create your account in PostgreSQL.'}
              </p>
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1">
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'login' ? 'bg-navy-900 text-white shadow' : 'text-slate-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'register' ? 'bg-navy-900 text-white shadow' : 'text-slate-600'
                }`}
              >
                Register
              </Link>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-3 rounded-xl border text-left transition ${
                      role === 'CUSTOMER'
                        ? 'border-safety-500 bg-safety-50/50 text-navy-900 ring-2 ring-safety-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">Vehicle Owner (CUSTOMER)</p>
                    <p className="text-[11px] text-slate-500">Book towing & roadside rescue</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`p-3 rounded-xl border text-left transition ${
                      role === 'PROVIDER'
                        ? 'border-safety-500 bg-safety-50/50 text-navy-900 ring-2 ring-safety-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">Service Partner (PROVIDER)</p>
                    <p className="text-[11px] text-slate-500">Accept jobs, bid & manage fleet</p>
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aarav Mehta"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-navy-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 30003"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-navy-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-navy-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-navy-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {mode === 'register' && role === 'CUSTOMER' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-safety-500" />
                  Default Vehicle & Address (Optional — pre-fills bookings)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={defaultVehicleMake}
                    onChange={(e) => setDefaultVehicleMake(e.target.value)}
                    placeholder="Make (Hyundai)"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    value={defaultVehicleModel}
                    onChange={(e) => setDefaultVehicleModel(e.target.value)}
                    placeholder="Model (Creta)"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    value={defaultVehicleRegistration}
                    onChange={(e) => setDefaultVehicleRegistration(e.target.value)}
                    placeholder="Reg (KA-01-AB-1234)"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <select
                    value={defaultVehicleType}
                    onChange={(e) => setDefaultVehicleType(e.target.value)}
                    className="px-2 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="Commercial">Commercial Truck/Van</option>
                  </select>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home / Primary City Address"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && role === 'PROVIDER' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-safety-500" />
                  Provider Business Details (Submitted for Admin Verification)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name (e.g. Highway Star Recovery) *"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="Trade / Towing License Number *"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Operating City *"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    required
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="Service Coverage Corridor *"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  value={supportedCategories}
                  onChange={(e) => setSupportedCategories(e.target.value)}
                  placeholder="Supported Categories (comma separated)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-safety-500 hover:bg-safety-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-safety-500/25 transition"
            >
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to AutoRescue'
                : `Create ${role} Account`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
