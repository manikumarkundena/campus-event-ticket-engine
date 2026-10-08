'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Ticket, Calendar, MapPin, ArrowRight, QrCode } from 'lucide-react';

export default function MyBookingsPage() {
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Passes & Registrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          All digital event passes and entry records for your student account.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 border border-slate-800">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-bold text-white text-base">No Passes Found</h3>
          <p className="text-xs text-slate-400">You have not registered for any campus events yet.</p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-indigo"
          >
            Explore Campus Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {b.event?.category || 'CAMPUS EVENT'}
                  </span>
                  <StatusBadge status={b.ticket?.status || b.status} />
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{b.event?.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {formatDate(b.event?.startDateTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {b.event?.venue}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-right sm:text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Code</p>
                  <p className="text-xs font-mono font-bold text-indigo-400">{b.ticket?.ticketCode}</p>
                </div>
                <Link
                  href={`/tickets/${b.id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Pass</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
