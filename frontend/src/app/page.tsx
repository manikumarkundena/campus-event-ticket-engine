'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HologramTicketHero } from '@/components/3d/HologramTicketHero';
import { EventCard } from '@/components/ui/EventCard';
import { CampusEvent } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  Calendar,
  Ticket,
  ShieldCheck,
  QrCode,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const res = await apiFetch<CampusEvent[]>('/events?limit=3');
      if (res.success && res.data) {
        setFeaturedEvents(res.data);
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Glow backdrop spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Headings & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Siddaganga Institute of Technology</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Next-Gen Campus <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                  Event Ticketing Engine
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamlining the entire campus event lifecycle with atomic capacity reservation, encrypted
                QR digital passes, and instant gate validation. Engineered for scale and bulletproof concurrency.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/events"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-glow-indigo flex items-center justify-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Discover Campus Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/gate/validate"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-emerald-400 font-semibold text-sm border border-emerald-500/30 shadow-glow-emerald flex items-center justify-center gap-2 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate Verification Scanner</span>
                </Link>
              </div>

              {/* Security & Concurrency Metric Pills */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white font-mono">0.0%</p>
                  <p className="text-xs text-slate-400">Overselling Rate</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">&lt; 15ms</p>
                  <p className="text-xs text-slate-400">Validation Speed</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">100%</p>
                  <p className="text-xs text-slate-400">ACID Transactional</p>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive 3D Holographic Pass Hero */}
            <div className="lg:col-span-5 flex justify-center">
              <HologramTicketHero />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Live Campus Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Upcoming Events at SIT</h2>
          </div>
          <Link
            href="/events"
            className="mt-3 md:mt-0 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Complete Event Lifecycle Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Architecture & Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Full-Lifecycle Campus Event Management</h2>
          <p className="text-sm text-slate-400">
            Engineered from the ground up to replace paper passes with cryptographically verified digital workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800 hover:border-indigo-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Organizer Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faculty and club leads define capacity, venues, and schedules with real-time analytics on registrations
              and gate turnout.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800 hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Atomic Capacity Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates overselling race conditions using relational ACID database transactions and conditional
              updates.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800 hover:border-purple-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Holographic Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apple Wallet-style digital pass featuring opaque QR verification payloads and attendee seat tokens.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800 hover:border-rose-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Gate Turnstile Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant mobile-optimized scanner for security gate staff. Validates credentials and prevents duplicate
              re-entry.
            </p>
          </div>
        </div>
      </section>

      {/* Live Demo Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-indigo-500/30 relative overflow-hidden text-center sm:text-left">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Academic Presentation</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Ready for Live Evaluation & Demonstration
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the end-to-end flow: log in as organizer to publish an event, switch to student to reserve a
              seat, and scan the QR pass at the gate validation turnstile.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo transition"
              >
                Launch Demo Portals
              </Link>
              <Link
                href="/events"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
