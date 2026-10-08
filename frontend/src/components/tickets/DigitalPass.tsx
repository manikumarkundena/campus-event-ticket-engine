'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Ticket,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Printer,
  Sparkles,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface DigitalPassProps {
  booking: Booking;
}

export function DigitalPass({ booking }: DigitalPassProps) {
  const { event, ticket, user } = booking;
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (!ticket) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl text-slate-400">
        No ticket generated for this booking record.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Physical Ticket Pass Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-pass relative transition-all duration-300">
        {/* Holographic Iridescent Foil Header */}
        <div className="h-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 via-emerald-400 to-amber-400 iridescent-foil" />

        {/* Top Header Strip: Institutional SIT Identity */}
        <div className="px-6 py-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-glow-indigo">
              SIT
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-tight uppercase">Siddaganga Institute</p>
              <p className="text-[10px] text-slate-400 font-mono">B.H. Road, Tumakuru</p>
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Front or Back Face Content */}
        {!isFlipped ? (
          <div>
            {/* Event Header */}
            <div className="p-6 bg-slate-900/60 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {event.category}
              </span>
              <h2 className="text-xl font-bold text-white leading-snug">{event.title}</h2>

              {/* Event Logistics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" /> Date & Time
                  </p>
                  <p className="font-semibold text-slate-200">{formatDate(event.startDateTime)}</p>
                  <p className="text-slate-400 font-mono text-[11px]">{formatTime(event.startDateTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> Venue
                  </p>
                  <p className="font-semibold text-slate-200 line-clamp-2">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Perforated Divider with Cutout Notches */}
            <div className="relative bg-slate-900 py-2">
              <div className="border-t-2 border-dashed border-slate-700/80 mx-6" />
              {/* Left Notch */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#070b14] border border-slate-700/60" />
              {/* Right Notch */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#070b14] border border-slate-700/60" />
            </div>

            {/* Bottom Scanner Plate: QR Code Target */}
            <div className="p-6 bg-slate-925 text-center flex flex-col items-center space-y-4">
              <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800 flex items-center justify-center">
                <QRCodeSVG
                  value={ticket.qrPayload}
                  size={175}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-mono font-bold text-indigo-400 tracking-widest uppercase">
                  {ticket.ticketCode}
                </p>
                <p className="text-[11px] text-slate-400">
                  Present this QR pass to security staff at gate turnstiles
                </p>
              </div>

              {/* Attendee Credential Info Strip */}
              <div className="w-full pt-4 border-t border-slate-800 flex items-center justify-between text-left text-xs">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Attendee</p>
                  <p className="font-bold text-white">{user?.name || 'Registered Student'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{user?.usn || user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Booking Ref</p>
                  <p className="font-mono text-slate-300 text-[11px]">{booking.bookingReference}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Back Face: Gate Entry Instructions & Cryptoseal Information */
          <div className="p-6 space-y-5 bg-slate-925">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                GATE CLEARANCE INSTRUCTIONS
              </span>
              <h3 className="text-lg font-bold text-white">SIT Campus Admission Policy</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>Single-Entry Token:</strong> This digital pass is valid for one student entry only. Duplicate scans at gate turnstiles will be locked out immediately.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>Physical ID Verification:</strong> Gate staff may request college RFID identification alongside this pass.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>Non-Transferable:</strong> Digital tickets are linked directly to your authenticated college account USN.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <p className="text-[10px] uppercase font-bold text-slate-500">Cryptoseal Payload Hash</p>
              <p className="text-slate-200 truncate">{ticket.qrPayload}</p>
            </div>
          </div>
        )}

        {/* Security Watermark Footer Strip */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Show Ticket Pass' : 'Show Entry Regulations'}</span>
          </button>

          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Cryptoseal Verified
          </span>
        </div>
      </div>

      {/* Action Strip: Print / Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 border border-slate-700 transition"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Print Pass (PDF)</span>
        </button>
      </div>
    </div>
  );
}
