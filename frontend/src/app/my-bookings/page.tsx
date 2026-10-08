'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Ticket,
  Calendar,
  MapPin,
  ArrowRight,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'USED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'VALID' && b.ticket?.status === 'VALID') ||
      (statusFilter === 'USED' && b.ticket?.status === 'USED');

    const matchesQuery =
      (b.event?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.ticket?.ticketCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.event?.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Digital Passes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access and present your verified digital event passes for campus entry.
          </p>
        </div>

        <Link
          href="/events"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Browse Campus Events</span>
        </Link>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Passes ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('VALID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'VALID'
                ? 'bg-emerald-600 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active Valid ({bookings.filter((b) => b.ticket?.status === 'VALID').length})
          </button>
          <button
            onClick={() => setStatusFilter('USED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'USED'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Attended ({bookings.filter((b) => b.ticket?.status === 'USED').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, pass ID, venue..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Passes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 border border-slate-800">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">No Passes Found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? 'No registrations match your search filter.'
              : 'You do not have any registered passes in this category.'}
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-indigo"
          >
            Explore Campus Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isValid = b.ticket?.status === 'VALID';
            return (
              <div
                key={b.id}
                className="glass-panel-interactive p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
              >
                {/* Visual stub border notch */}
                <div
                  className={`w-1 absolute left-0 inset-y-0 ${
                    isValid ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />

                <div className="space-y-2 flex-1 pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {b.event?.category || 'CAMPUS EVENT'}
                    </span>
                    <StatusBadge status={b.ticket?.status || b.status} />
                  </div>

                  <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                    {b.event?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {formatDate(b.event?.startDateTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {formatTime(b.event?.startDateTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {b.event?.venue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800 pl-2 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Pass Code</p>
                    <p className="text-xs font-mono font-bold text-indigo-300">{b.ticket?.ticketCode}</p>
                  </div>
                  <Link
                    href={`/tickets/${b.id}`}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition shrink-0 ${
                      isValid
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isValid ? 'Open Pass' : 'View Pass Stub'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
