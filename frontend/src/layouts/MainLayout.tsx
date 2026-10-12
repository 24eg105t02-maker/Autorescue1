import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  PhoneCall,
  Wrench,
  LayoutDashboard,
  PlusCircle,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, sessionExpiredMsg, clearSessionExpiredMsg } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('info', 'Signed Out', 'You have been securely logged out of AutoRescue.');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'PROVIDER') return '/provider';
    return '/customer';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Emergency Banner */}
      <div className="bg-navy-950 text-slate-300 text-xs py-2 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-safety-500/20 text-safety-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-safety-500 animate-ping" />
              24/7 AI-Assisted Dispatch Active
            </span>
            <span className="hidden sm:inline text-slate-400">
              Verified Flatbed Towing, Battery Jump-Start, EV Rescue & On-Site Mechanics
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-white font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-safety-500" />
              Emergency Helpline: 1800-AUTO-911
            </span>
            <a
              href="http://localhost:8080/swagger-ui/index.html"
              target="_blank"
              rel="noreferrer"
              className="text-safety-400 hover:text-safety-300 underline font-medium hidden md:inline"
            >
              Swagger API Docs
            </a>
          </div>
        </div>
      </div>

      {/* Session Expired Alert */}
      {sessionExpiredMsg && (
        <div className="bg-amber-500 text-navy-950 px-4 py-2.5 text-sm font-semibold flex items-center justify-between">
          <span>{sessionExpiredMsg}</span>
          <button onClick={clearSessionExpiredMsg} className="underline text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-lg border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-safety-500 flex items-center justify-center shadow-md shadow-safety-500/30 group-hover:bg-safety-600 transition">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Auto<span className="text-safety-500">Rescue</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 -mt-1">
                Roadside Command Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`hover:text-safety-400 transition ${
                location.pathname === '/' ? 'text-safety-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`hover:text-safety-400 transition flex items-center gap-1.5 ${
                location.pathname === '/services' ? 'text-safety-400 font-semibold' : 'text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              Roadside Services
            </Link>

            {user?.role === 'CUSTOMER' && (
              <>
                <Link
                  to="/customer?tab=book"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-safety-500 hover:bg-safety-600 text-white font-semibold shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Book Assistance
                </Link>
                <Link
                  to="/customer"
                  className={`hover:text-safety-400 transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/customer') ? 'text-safety-400 font-semibold' : 'text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Customer Portal
                </Link>
              </>
            )}

            {user?.role === 'PROVIDER' && (
              <Link
                to="/provider"
                className={`hover:text-safety-400 transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/provider') ? 'text-safety-400 font-semibold' : 'text-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Provider Dispatch Hub
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`hover:text-safety-400 transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin') ? 'text-safety-400 font-semibold' : 'text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Command Center
              </Link>
            )}
          </nav>

          {/* Right Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-safety-500/20 border border-safety-500 text-safety-400 flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-safety-400">
                      {user.role}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-safety-500 hover:bg-safety-600 text-white shadow-md shadow-safety-500/25 transition"
                >
                  Get Roadside Help
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-900 border-t border-navy-800 px-4 pt-3 pb-5 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              Roadside Services Catalog
            </Link>
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-safety-400 bg-navy-800"
                >
                  Open {user.role} Dashboard ({user.fullName})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-navy-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-navy-800 text-white text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-safety-500 text-white text-sm font-semibold"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-safety-500 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-extrabold text-white">
                  Auto<span className="text-safety-500">Rescue</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                AI-Assisted Roadside Assistance & Fleet Recovery Platform connecting stranded vehicle owners with verified towing operators, EV specialists, and mobile mechanics.
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Backed by Java 21, Spring Boot 3, Spring Security JWT, and PostgreSQL 17 with Flyway Migrations.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-safety-400">Home</Link></li>
                <li><Link to="/services" className="hover:text-safety-400">10 Roadside Services</Link></li>
                <li><Link to="/login" className="hover:text-safety-400">Customer & Provider Login</Link></li>
                <li><Link to="/register" className="hover:text-safety-400">Partner Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Developer & API</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noreferrer" className="hover:text-safety-400">
                    Swagger OpenAPI UI
                  </a>
                </li>
                <li>
                  <a href="http://localhost:8080/v3/api-docs" target="_blank" rel="noreferrer" className="hover:text-safety-400">
                    OpenAPI JSON Spec
                  </a>
                </li>
                <li className="text-xs text-slate-500 pt-1">
                  Transparent Pricing: Base Fee + (Distance × Rate/Km) + Additional Charges
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 AutoRescue Roadside Assistance Platform. All rights reserved.</p>
            <p>Mock AI Triage & Demonstration Payment Gateway clearly disclosed per compliance standards.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
