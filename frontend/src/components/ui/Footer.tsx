import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, QrCode, Building2, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Platform Brand Identity & Institution */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow-indigo">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-wider">EVENTRA</span>
              <p className="text-xs text-indigo-400 font-medium">Campus Events & Digital Entry</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            A comprehensive campus event management and digital ticketing platform deployed for{' '}
            <span className="text-slate-200 font-medium">Siddaganga Institute of Technology</span>.
            Streamlining event registrations, digital pass generation, and secure gate entry check-ins.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <Ticket className="w-3 h-3 text-indigo-400" /> Digital Passes
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <QrCode className="w-3 h-3 text-emerald-400" /> Gate Verification
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-purple-400" /> Role-Based Access
            </span>
          </div>
        </div>

        {/* Col 2: Platform Links */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/events" className="hover:text-white transition">
                Event Catalog
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/my-bookings" className="hover:text-white transition">
                My Tickets
              </Link>
            </li>
            <li>
              <Link href="/organizer/dashboard" className="hover:text-white transition">
                Organizer Studio
              </Link>
            </li>
            <li>
              <Link href="/gate/validate" className="hover:text-emerald-400 transition text-emerald-400 font-medium">
                Gate Verification
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Institution & Campus */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Institution</h4>
          <div className="text-sm space-y-1.5 text-slate-400">
            <p className="text-slate-200 font-medium">Siddaganga Institute of Technology</p>
            <p>B.H. Road, Tumakuru, Karnataka 572103</p>
            <div className="pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Deployed Campus Platform
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 EVENTRA. Deployed for Siddaganga Institute of Technology. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Campus Events & Digital Entry Platform</p>
      </div>
    </footer>
  );
}
