'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { OrganizerMetrics } from '@/types';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Calendar,
  Users,
  Ticket,
  Plus,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<OrganizerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const res = await apiFetch<OrganizerMetrics>('/events/organizer/dashboard');
      if (res.success && res.data) {
        setMetrics(res.data);
      }
      setLoading(false);
    }
    loadMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Faculty / Club Organizer Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Event Operations & Analytics</h1>
          <p className="text-xs text-slate-400">
            Real-time database metrics for events organized by {user?.name || 'SIT Organizer'}.
          </p>
        </div>

        <Link
          href="/organizer/events/new"
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Events</span>
          <p className="text-3xl font-bold font-mono text-white">{metrics?.totalEvents || 0}</p>
          <p className="text-[11px] text-slate-500">Managed in portfolio</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Student Bookings</span>
          <p className="text-3xl font-bold font-mono text-indigo-400">{metrics?.totalBookings || 0}</p>
          <p className="text-[11px] text-slate-500">Confirmed seat registrations</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Overall Capacity Fill</span>
          <p className="text-3xl font-bold font-mono text-emerald-400">
            {metrics?.capacityFillRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500">Total capacity reserved</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Gate Turnout Rate</span>
          <p className="text-3xl font-bold font-mono text-purple-400">
            {metrics?.validationRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500">
            {metrics?.totalValidatedTickets || 0} checked in at gate
          </p>
        </div>
      </div>

      {/* Events Operational Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Active Campus Events Portfolio
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {metrics?.eventsSummary?.length || 0} events listed
          </span>
        </div>

        {loading ? (
          <div className="h-48 glass-panel animate-pulse rounded-xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Gate Turnout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {metrics?.eventsSummary?.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link href={`/events/${ev.id}`} className="hover:text-indigo-400 transition">
                        {ev.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{ev.category}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{ev.venue}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-300">
                      {ev.bookedCount} / {ev.totalCapacity}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      {ev.validatedCount} checked in
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/events/${ev.id}`}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
