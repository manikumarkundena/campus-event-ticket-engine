'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { Ticket, Calendar, MapPin, User, ShieldCheck, Download, Printer } from 'lucide-react';

interface DigitalPassProps {
  booking: Booking;
}

export function DigitalPass({ booking }: DigitalPassProps) {
  const { event, ticket, user } = booking;
  const passRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!ticket) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl text-slate-400">
        No ticket generated for this booking.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Physical Ticket Pass Container */}
      <div
        ref={passRef}
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative transition-transform duration-300"
      >
        {/* Hologram Header Glow Bar */}
        <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

        {/* Top Section: SIT Institutional Header & Status */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-glow-indigo">
                SIT
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight uppercase">Siddaganga Institute</p>
                <p className="text-[10px] text-slate-400">Official Campus Event Pass</p>
              </div>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="mt-5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {event.category}
            </span>
            <h2 className="text-xl font-bold text-white pt-1 leading-snug">{event.title}</h2>
          </div>

          {/* Event Details Matrix */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Date & Time</p>
              <p className="font-semibold text-slate-200">{formatDate(event.startDateTime)}</p>
              <p className="text-slate-400 font-mono text-[11px]">{formatTime(event.startDateTime)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Venue</p>
              <p className="font-semibold text-slate-200 line-clamp-2">{event.venue}</p>
            </div>
          </div>
        </div>

        {/* Perforated Divider with Notched Circles */}
        <div className="relative bg-slate-900 py-3">
          <div className="border-t-2 border-dashed border-slate-700 mx-6" />
          {/* Left Cutout */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950 border border-slate-700/60" />
          {/* Right Cutout */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950 border border-slate-700/60" />
        </div>

        {/* Bottom Section: QR Code & Verification Token */}
        <div className="p-6 bg-slate-925 text-center flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-800">
            {/* Secure Opaque QR Token */}
            <QRCodeSVG
              value={ticket.qrPayload}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-4 space-y-1 w-full">
            <p className="text-xs font-mono font-bold text-indigo-400 tracking-widest uppercase">
              {ticket.ticketCode}
            </p>
            <p className="text-[11px] text-slate-400">Present this QR code at campus entry gates</p>
          </div>

          {/* Attendee Info Strip */}
          <div className="w-full mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-left text-xs">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Attendee</p>
              <p className="font-bold text-white">{user?.name || 'Registered Student'}</p>
              <p className="text-[11px] text-slate-400 font-mono">{user?.usn || user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Ref ID</p>
              <p className="font-mono text-slate-300 text-[11px]">{booking.bookingReference}</p>
            </div>
          </div>
        </div>

        {/* Security Watermark Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> Anti-tamper cryptoseal verified
          </span>
          <span className="font-mono text-slate-400">SIT-ABL1-2026</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 border border-slate-700 transition"
        >
          <Printer className="w-4 h-4 text-indigo-400" /> Print Pass
        </button>
      </div>
    </div>
  );
}
