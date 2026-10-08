'use client';

import React from 'react';
import Link from 'next/link';
import { CampusEvent } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, Users, Ticket, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  hasBooked?: boolean;
}

export function EventCard({ event, hasBooked = false }: EventCardProps) {
  const isSoldOut = event.availableCapacity <= 0;
  const isCancelled = event.status === 'CANCELLED';
  const bookedCount = event.totalCapacity - event.availableCapacity;
  const fillPercentage = Math.round((bookedCount / event.totalCapacity) * 100);

  const categoryColors: Record<string, string> = {
    TECHNICAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CULTURAL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    SPORTS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WORKSHOP: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HACKATHON: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col group h-full">
      {/* Banner Image or Category Gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
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

        {/* Category & Status Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border backdrop-blur-md ${
              categoryColors[event.category] || 'bg-slate-800 text-slate-300'
            }`}
          >
            {event.category}
          </span>
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {formatDate(event.startDateTime)} • {formatTime(event.startDateTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity Indicator & Booking Action */}
        <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Capacity
              </span>
              <span
                className={`font-semibold ${
                  isSoldOut
                    ? 'text-rose-400'
                    : event.availableCapacity < 10
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {isSoldOut ? 'Sold Out' : `${event.availableCapacity} seats left`}
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
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo'
            }`}
          >
            <span>
              {hasBooked ? 'View My Pass' : isSoldOut ? 'Event Full' : isCancelled ? 'Cancelled' : 'View & Reserve'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
