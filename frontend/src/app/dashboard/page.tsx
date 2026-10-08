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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Student Portal Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            USN: {user?.usn || '1SI22CS101'} • {user?.department || 'Computer Science'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Browse More Events</span>
          </Link>
          <Link
            href="/my-bookings"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            All Passes ({bookings.length})
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Valid Active Passes</span>
          <p className="text-3xl font-bold font-mono text-emerald-400">{activeBookings.length}</p>
          <p className="text-[11px] text-slate-500">Ready for gate scanning</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Past Attended Events</span>
          <p className="text-3xl font-bold font-mono text-indigo-400">{usedBookings.length}</p>
          <p className="text-[11px] text-slate-500">Entries recorded at turnstile</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Reservations</span>
          <p className="text-3xl font-bold font-mono text-white">{bookings.length}</p>
          <p className="text-[11px] text-slate-500">All registered campus events</p>
        </div>
      </div>

      {/* Active Passes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            My Active Passes
          </h2>
          <Link href="/my-bookings" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            View All History →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 rounded-2xl glass-panel animate-pulse" />
            <div className="h-44 rounded-2xl glass-panel animate-pulse" />
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-3 border border-slate-800">
            <p className="text-sm text-slate-400">You don’t have any active passes right now.</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-indigo"
            >
              Browse Campus Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel-interactive p-5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between space-y-4"
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

                <div className="space-y-1 text-xs text-slate-300">
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
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center gap-1.5 transition"
                  >
                    <span>Open Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
