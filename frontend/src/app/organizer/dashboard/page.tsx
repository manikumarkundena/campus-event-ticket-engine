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
  QrCode,
  Search,
  ExternalLink,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<OrganizerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const filteredEvents = (metrics?.eventsSummary || []).filter((ev) => {
    const matchesQuery =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-glow-indigo">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              SIT Faculty & Club Studio
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{user?.department || 'Department Coordinator'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Event Operations Command Center
          </h1>
          <p className="text-xs text-slate-300">
            Real-time event capacity tracking, turnstile check-in stats, and roster management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gate/validate"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Gate Kiosk</span>
          </Link>
          <Link
            href="/organizer/events/new"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Portfolio Events</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{metrics?.totalEvents || 0}</p>
          <p className="text-[11px] text-slate-500">Under your management</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Student Bookings</span>
            <Ticket className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-indigo-400">{metrics?.totalBookings || 0}</p>
          <p className="text-[11px] text-slate-500">Atomic seat reservations</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Capacity Fill</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-400">
            {metrics?.capacityFillRate || 0}%
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, metrics?.capacityFillRate || 0)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Turnstile Check-In Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-purple-400">
            {metrics?.validationRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500">
            {metrics?.totalValidatedTickets || 0} attendees verified at gate
          </p>
        </div>
      </div>

      {/* Events Operational Table & Management */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-5 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Campus Events Portfolio
            </h2>
            <p className="text-xs text-slate-400">
              Select any event to view live attendee rosters and capacity allocation.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter events..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-56 glass-panel animate-pulse rounded-2xl" />
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No events found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Capacity Utilization</th>
                  <th className="py-3 px-4">Gate Turnout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEvents.map((ev) => {
                  const fillPct = Math.round((ev.bookedCount / ev.totalCapacity) * 100);
                  return (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/events/${ev.id}`}
                          className="font-bold text-white hover:text-indigo-400 transition text-sm flex items-center gap-1.5"
                        >
                          <span>{ev.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ev.venue}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase">
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                          <span className="font-bold text-white">{ev.bookedCount} / {ev.totalCapacity}</span>
                          <span className="text-slate-400">{fillPct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPct > 85 ? 'bg-amber-400' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, fillPct)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {ev.validatedCount} checked in
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ev.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
