import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Navigation,
  Bike,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  BatteryCharging,
  Disc,
  Fuel,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calculator,
  Camera,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { ServiceCategory } from '../types';
import { useAuth } from '../context/AuthContext';

export const ServiceIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Navigation':
      return <Navigation className={className} />;
    case 'Bike':
      return <Bike className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'BatteryCharging':
      return <BatteryCharging className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Fuel':
      return <Fuel className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    default:
      return <Truck className={className} />;
  }
};

export const LandingPage: React.FC<{ servicesOnly?: boolean }> = ({ servicesOnly = false }) => {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistance, setSelectedDistance] = useState<number>(8);
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get<ServiceCategory[]>('/services');
        setServices(res.data);
      } catch {
        // Fallback if backend is starting
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBookService = (serviceId: number) => {
    if (!user) {
      navigate(`/login?redirect=/customer?tab=book&serviceId=${serviceId}`);
      return;
    }
    if (user.role === 'CUSTOMER') {
      navigate(`/customer?tab=book&serviceId=${serviceId}`);
    } else if (user.role === 'PROVIDER') {
      navigate('/provider');
    } else {
      navigate('/admin');
    }
  };

  const filteredServices = services.filter((s) => {
    if (vehicleFilter === 'ALL') return true;
    return s.supportedVehicleTypes.toLowerCase().includes(vehicleFilter.toLowerCase());
  });

  return (
    <div>
      {!servicesOnly && (
        <section className="navy-gradient text-white relative overflow-hidden border-b border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-22 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-safety-500/15 border border-safety-500/40 text-safety-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Assisted Emergency Roadside Platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  Stranded on the Road?{' '}
                  <span className="text-safety-500">AutoRescue</span> Dispatches Help in Minutes.
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                  Connect immediately with verified flatbed towing operators, EV high-voltage rescue units, and mobile mechanics. Real-time PostgreSQL dispatch, transparent per-kilometre pricing, and instant tax invoicing.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() =>
                      user ? navigate('/customer?tab=book') : navigate('/register?role=CUSTOMER')
                    }
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-base shadow-xl shadow-safety-500/30 transition transform hover:-translate-y-0.5"
                  >
                    Request Emergency Rescue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <Link
                    to="/register?role=PROVIDER"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-base border border-navy-600 transition"
                  >
                    Join as Towing / Mechanic Partner
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-navy-800/80">
                  <div>
                    <p className="text-2xl font-extrabold text-safety-400">10+</p>
                    <p className="text-xs text-slate-400">Specialized Roadside Categories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">~18 Min</p>
                    <p className="text-xs text-slate-400">Average Urban Dispatch ETA</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-emerald-400">100%</p>
                    <p className="text-xs text-slate-400">Verified Recovery Partners</p>
                  </div>
                </div>
              </div>

              {/* Interactive Live Fare Estimator Card */}
              <div className="lg:col-span-5">
                <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-navy-900 text-safety-500 flex items-center justify-center">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900 text-base">Live Tariff Calculator</h3>
                        <p className="text-xs text-slate-500">Transparent Formula Estimate</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      Demo Estimate
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>Estimated Towing / Travel Distance</span>
                      <span className="text-safety-600 font-bold">{selectedDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={selectedDistance}
                      onChange={(e) => setSelectedDistance(Number(e.target.value))}
                      className="w-full accent-safety-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1 km</span>
                      <span>25 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-navy-900">Pricing Formula:</p>
                    <p className="text-slate-600 font-mono text-[11px]">
                      Estimated Price = Base Fee + (Distance × Rate/Km) + Additional Charges
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {services.slice(0, 4).map((srv) => {
                      const est =
                        Number(srv.baseFee) +
                        selectedDistance * Number(srv.ratePerKm) +
                        Number(srv.additionalCharges);
                      return (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-safety-500 bg-white transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                              <ServiceIcon name={srv.iconName} className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-navy-900">{srv.name}</p>
                              <p className="text-[11px] text-slate-500">
                                Base ₹{srv.baseFee} + ₹{srv.ratePerKm}/km + ₹{srv.additionalCharges}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-navy-900">₹{est.toFixed(0)}</p>
                            <button
                              onClick={() => handleBookService(srv.id)}
                              className="text-[11px] font-bold text-safety-600 hover:underline"
                            >
                              Book Now →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      user ? navigate('/customer?tab=book') : navigate('/login')
                    }
                    className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm transition"
                  >
                    Open Full 12-Step Booking Wizard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10 Roadside Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-safety-600">
              PostgreSQL-Backed Service Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 mt-1">
              10 Specialized Roadside Assistance Services
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Every service includes live tariff estimation, supported vehicle classes, and immediate dispatch booking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['ALL', 'Sedan', 'SUV', 'Motorcycle', 'EV', 'Commercial'].map((filter) => (
              <button
                key={filter}
                onClick={() => setVehicleFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  vehicleFilter === filter
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {filter === 'ALL' ? 'All Vehicles' : filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const sample5Km =
                Number(service.baseFee) +
                5 * Number(service.ratePerKm) +
                Number(service.additionalCharges);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-navy-300 transition flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-navy-900 text-safety-500 flex items-center justify-center shrink-0 shadow-md">
                        <ServiceIcon name={service.iconName} className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <Clock className="w-3.5 h-3.5" />
                        ETA ~{service.estimatedEtaMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Supported Vehicle Types
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.supportedVehicleTypes.split(',').map((v) => (
                          <span
                            key={v}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                          >
                            {v.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500">
                          Base ₹{service.baseFee} + ₹{service.ratePerKm}/km + ₹{service.additionalCharges} fee
                        </p>
                        <p className="text-xs font-bold text-navy-900">
                          Est. 5 km Rescue: <span className="text-safety-600">₹{sample5Km.toFixed(0)}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Est.
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookService(service.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-safety-500 hover:bg-safety-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      Book {service.name}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* End-to-End Workflow Section */}
      {!servicesOnly && (
        <section className="bg-white border-y border-slate-200 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-safety-600">
                Complete Full-Stack Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-navy-900 mt-1">
                How AutoRescue Works End-to-End
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Built with role-based JWT security, PostgreSQL persistence, verified provider dispatch, and automated GST invoicing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: <Camera className="w-6 h-6 text-safety-500" />,
                  step: '01',
                  title: 'AI Triage & Price Estimate',
                  desc: 'Enter vehicle details, upload an optional breakdown photo for Mock AI triage, and review the transparent distance-based price estimate.',
                },
                {
                  icon: <MapPin className="w-6 h-6 text-safety-500" />,
                  step: '02',
                  title: 'Instant PostgreSQL Dispatch',
                  desc: 'Confirm booking to generate a unique Booking ID (AR-2026-XXXX) and broadcast to approved nearby providers.',
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-safety-500" />,
                  step: '03',
                  title: 'Live Tracking & Rescue',
                  desc: 'Approved providers accept the job or submit bids, and update live status from ACCEPTED → EN_ROUTE → IN_PROGRESS → COMPLETED.',
                },
                {
                  icon: <CheckCircle2 className="w-6 h-6 text-safety-500" />,
                  step: '04',
                  title: 'Payment, Invoice & Review',
                  desc: 'Complete payment via Razorpay Test Mode or clearly labelled Mock Payment, download your GST invoice, and rate your provider.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative"
                >
                  <span className="text-3xl font-black text-slate-200 absolute top-4 right-5">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-navy-900 text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
