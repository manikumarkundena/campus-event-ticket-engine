'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/types';
import { apiFetch } from '@/lib/api';
import { DigitalPass } from '@/components/tickets/DigitalPass';
import { ArrowLeft, Ticket, AlertCircle } from 'lucide-react';

export default function TicketPresentationPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      const res = await apiFetch<Booking>(`/bookings/${bookingId}`);
      if (res.success && res.data) {
        setBooking(res.data);
      }
      setLoading(false);
    }
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="h-[550px] rounded-3xl glass-panel animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center glass-panel rounded-3xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">Could not retrieve ticket details or unauthorized.</p>
        <Link href="/my-bookings" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
        <span className="text-xs font-mono text-indigo-400 font-semibold">
          Ref: {booking.bookingReference}
        </span>
      </div>

      {/* Render Digital Pass */}
      <DigitalPass booking={booking} />
    </div>
  );
}
