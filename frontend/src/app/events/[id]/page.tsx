'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CampusEvent, Booking } from '@/types';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import confetti from 'canvas-confetti';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await apiFetch<CampusEvent>(`/events/${eventId}`);
      if (res.success && res.data) {
        setEvent(res.data);
      }

      // Check if user already booked this event
      if (user) {
        const myBookingsRes = await apiFetch<Booking[]>('/bookings/my');
        if (myBookingsRes.success && myBookingsRes.data) {
          const match = myBookingsRes.data.find(
            (b) => b.eventId === eventId && b.status === 'CONFIRMED'
          );
          if (match) {
            setExistingBooking(match);
          }
        }
      }
      setLoading(false);
    }

    if (eventId) {
      loadData();
    }
  }, [eventId, user]);

  const handleBookTicket = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setBookingError('');
    setBookingInProgress(true);

    const res = await apiFetch<{ booking: Booking; ticket: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });

    setBookingInProgress(false);

    if (res.success && res.data) {
      setBookingSuccess(res.data);
      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#a855f7'],
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      setBookingError(res.error || 'Failed to reserve seat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-[450px] glass-panel rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center glass-panel rounded-3xl border border-slate-800 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-slate-400">The requested event could not be found or has been cancelled.</p>
        <Link href="/events" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableCapacity <= 0;
  const bookedCount = event.totalCapacity - event.availableCapacity;
  const fillPercentage = Math.round((bookedCount / event.totalCapacity) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Event Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800">
        <div className="h-64 sm:h-80 w-full relative">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Chips */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-indigo-400 border border-indigo-500/30 backdrop-blur-md">
              {event.category}
            </span>
            <StatusBadge status={event.status} />
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{event.venue}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Description & Logistics */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              About This Event
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Schedule & Organizer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" /> Date & Schedule
              </div>
              <p className="font-bold text-white text-sm">{formatDate(event.startDateTime)}</p>
              <p className="text-xs text-slate-400 font-mono">
                {formatTime(event.startDateTime)} — {formatTime(event.endDateTime)}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Building className="w-4 h-4 text-emerald-400" /> Organizer
              </div>
              <p className="font-bold text-white text-sm">{event.organizer?.name || 'SIT Faculty / Club'}</p>
              <p className="text-xs text-slate-400">{event.organizer?.department || 'SIT Campus'}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Capacity Meter & Action Card */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/30 shadow-ticket space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400">Official Pass</p>
                <p className="text-base font-bold text-white">Student Free Pass</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Verified Event
              </span>
            </div>

            {/* Live Capacity Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  Remaining Capacity
                </span>
                <span
                  className={`font-mono font-bold ${
                    isSoldOut
                      ? 'text-rose-400'
                      : event.availableCapacity < 10
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {isSoldOut ? '0 Available' : `${event.availableCapacity} / ${event.totalCapacity} Seats`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-rose-500'
                      : fillPercentage > 85
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, fillPercentage)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                {bookedCount} student{bookedCount === 1 ? '' : 's'} registered
              </p>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Booking State Actions */}
            {existingBooking ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You have an active pass reserved for this event!</span>
                </div>
                <Link
                  href={`/tickets/${existingBooking.id}`}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View My Digital Pass</span>
                </Link>
              </div>
            ) : bookingSuccess ? (
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Seat Reserved Successfully!</h3>
                <p className="text-xs text-slate-400">
                  Your ticket code is <span className="font-mono text-indigo-400 font-bold">{bookingSuccess.ticket.ticketCode}</span>
                </p>
                <Link
                  href={`/tickets/${bookingSuccess.booking.id}`}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition block"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Open Digital QR Pass</span>
                </Link>
              </div>
            ) : (
              <button
                onClick={handleBookTicket}
                disabled={bookingInProgress || isSoldOut || event.status !== 'PUBLISHED'}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {bookingInProgress
                    ? 'Processing Transaction...'
                    : isSoldOut
                    ? 'Event Full (Sold Out)'
                    : event.status !== 'PUBLISHED'
                    ? `Not Open (${event.status})`
                    : 'Reserve My Pass (Instant)'}
                </span>
              </button>
            )}

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero duplicate booking protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Strict atomic capacity decrement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
