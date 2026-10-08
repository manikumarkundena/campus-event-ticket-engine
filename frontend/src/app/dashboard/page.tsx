'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Booking, CampusEvent } from '@/types';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Ticket,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  QrCode,
  User,
  Compass,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await apiFetch<Booking[]>('/bookings/my');
      if (res.success && res.data) {
        setBookings(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const activeBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && b.ticket?.status === 'VALID'
  );
  const usedBookings = bookings.filter((b) => b.ticket?.status === 'USED');
  const nextPass = activeBookings[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Identity Card & Welcome Header */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-glow-indigo relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Student Avatar with SIT Gold border */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-600 p-0.5 shrink-0 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-extrabold text-xl font-mono">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  SIT Student Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300 font-mono">2026 Academic Session</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user?.name || 'SIT Student'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="text-indigo-300 font-bold">USN: {user?.usn || '1SI22CS101'}</span>
                <span>•</span>
                <span>{user?.department || 'Computer Science & Engineering'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>
            <Link
              href="/my-bookings"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              All Passes ({bookings.length})
            </Link>
          </div>
        </div>

        {/* Metric Counter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Valid Active Passes</span>
            <p className="text-2xl font-bold font-mono text-emerald-400">{activeBookings.length}</p>
            <p className="text-[11px] text-slate-500">Ready for gate scanning</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Past Events Attended</span>
            <p className="text-2xl font-bold font-mono text-indigo-400">{usedBookings.length}</p>
            <p className="text-[11px] text-slate-500">Recorded entry validations</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Total Reservations</span>
            <p className="text-2xl font-bold font-mono text-white">{bookings.length}</p>
            <p className="text-[11px] text-slate-500">Lifetime campus registrations</p>
          </div>
        </div>
      </div>

      {/* Primary Next Pass Spotlight Card (if student has active pass) */}
      {nextPass && (
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-glow-emerald space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Up Next • Ready For Gate Check-in
              </span>
            </div>
            <StatusBadge status={nextPass.ticket?.status || 'VALID'} />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {nextPass.event?.category || 'CAMPUS EVENT'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {nextPass.event?.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formatDate(nextPass.event?.startDateTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {formatTime(nextPass.event?.startDateTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {nextPass.event?.venue}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500">Pass Code</span>
                <p className="text-sm font-mono font-bold text-emerald-400">{nextPass.ticket?.ticketCode}</p>
              </div>
              <Link
                href={`/tickets/${nextPass.id}`}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-2 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Digital Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Active Passes Section Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            My Active Passes ({activeBookings.length})
          </h2>
          <Link href="/my-bookings" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            View All History →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 rounded-3xl glass-panel animate-pulse" />
            <div className="h-44 rounded-3xl glass-panel animate-pulse" />
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-slate-800">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Active Passes</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not have any upcoming passes right now. Browse open campus events to reserve your seat.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-indigo transition"
            >
              Browse Campus Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel-interactive p-6 rounded-3xl border border-indigo-500/20 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {b.event?.category || 'EVENT'}
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug pt-1">
                      {b.event?.title}
                    </h3>
                  </div>
                  <StatusBadge status={b.ticket?.status || 'VALID'} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{formatDate(b.event?.startDateTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="line-clamp-1">{b.event?.venue}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    {b.ticket?.ticketCode}
                  </span>
                  <Link
                    href={`/tickets/${b.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
