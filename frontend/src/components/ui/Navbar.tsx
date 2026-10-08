'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Ticket,
  Calendar,
  Shield,
  QrCode,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';

export function Navbar() {
  const { user, logout, switchDemoRole } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Academic Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-glow-indigo text-white group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SIT Pass</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  ABL-1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Siddaganga Institute of Technology
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/events"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/events')
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>

            {user?.role === 'STUDENT' && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/dashboard')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/my-bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/my-bookings')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <Ticket className="w-4 h-4" />
                  My Passes
                </Link>
              </>
            )}

            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Link
                href="/organizer/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/organizer/dashboard')
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Organizer Studio
              </Link>
            )}

            {(user?.role === 'GATE_STAFF' || user?.role === 'ADMIN') && (
              <Link
                href="/gate/validate"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/gate/validate')
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald'
                    : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/40'
                  }`}
              >
                <QrCode className="w-4 h-4" />
                Gate Scanner
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/admin/dashboard')
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Section: Demo Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                title="Quickly switch demo role for presentation"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Role: {user?.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {demoDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl glass-panel shadow-2xl p-2 z-50 border border-slate-700"
                  onClick={() => setDemoDropdownOpen(false)}
                >
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Demo Account:
                  </p>
                  {(['STUDENT', 'ORGANIZER', 'GATE_STAFF', 'ADMIN'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchDemoRole(r)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition flex items-center justify-between ${user?.role === r
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <span>{r.replace('_', ' ')}</span>
                      {user?.role === r && <span className="text-[10px]">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-medium text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{user.department || user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-glow-indigo transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Browse Events
          </Link>

          {user?.role === 'STUDENT' && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Student Dashboard
              </Link>
              <Link
                href="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                My Tickets & Passes
              </Link>
            </>
          )}

          {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
            <Link
              href="/organizer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Organizer Dashboard
            </Link>
          )}

          {(user?.role === 'GATE_STAFF' || user?.role === 'ADMIN') && (
            <Link
              href="/gate/validate"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-950/30"
            >
              Gate Validation Scanner
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-400"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 w-full font-semibold">Demo Role Switcher:</span>
            {(['STUDENT', 'ORGANIZER', 'GATE_STAFF', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchDemoRole(r);
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1 text-xs rounded ${user?.role === r ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out ({user.name})
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm bg-slate-800 rounded-lg text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm bg-indigo-600 rounded-lg text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
