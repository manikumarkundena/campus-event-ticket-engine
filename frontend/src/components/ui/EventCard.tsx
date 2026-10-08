'use client';

import React from 'react';
import Link from 'next/link';
import { CampusEvent } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, Users, Ticket, ArrowRight, Building2 } from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  hasBooked?: boolean;
}

export function EventCard({ event, hasBooked = false }: EventCardProps) {
  const isSoldOut = event.availableCapacity <= 0;
  const isCancelled = event.status === 'CANCELLED';
  const bookedCount = event.totalCapacity - event.availableCapacity;
  const fillPercentage = Math.round((bookedCount / event.totalCapacity) * 100);

  const categoryStyles: Record<string, { badge: string; border: string }> = {
    TECHNICAL: {
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      border: 'hover:border-cyan-500/40',
    },
    HACKATHON: {
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      border: 'hover:border-amber-500/40',
    },
    CULTURAL: {
      badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      border: 'hover:border-purple-500/40',
    },
    WORKSHOP: {
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      border: 'hover:border-emerald-500/40',
    },
    SPORTS: {
      badge: 'bg-green-500/10 text-green-300 border-green-500/30',
      border: 'hover:border-green-500/40',
    },
  };

  const currentTheme = categoryStyles[event.category] || {
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    border: 'hover:border-indigo-500/40',
  };

  return (
    <div className={`glass-panel-interactive rounded-3xl overflow-hidden flex flex-col group h-full border border-slate-800 ${currentTheme.border}`}>
      {/* Banner Image or Category Hero Block */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900 shrink-0">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <Ticket className="w-12 h-12 text-indigo-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${currentTheme.badge}`}
          >
            {event.category}
          </span>
          <StatusBadge status={event.status} />
        </div>

        {/* Floating Date Badge on Image Bottom */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">{formatDate(event.startDateTime)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{event.organizer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Indicator & Booking Action */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Seat Availability
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  isSoldOut
                    ? 'text-rose-400'
                    : event.availableCapacity < 10
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {isSoldOut ? 'Sold Out' : `${event.availableCapacity} / ${event.totalCapacity} Seats`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
          </div>

          <Link
            href={`/events/${event.id}`}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              hasBooked
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                : isSoldOut || isCancelled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo'
            }`}
          >
            <span>
              {hasBooked
                ? 'View Reserved Pass'
                : isSoldOut
                ? 'Capacity Reached'
                : isCancelled
                ? 'Event Cancelled'
                : 'View Event & Reserve Pass'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
