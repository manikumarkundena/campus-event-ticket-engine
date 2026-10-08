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
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  CheckCircle2,
  GraduationCap,
  Layers,
  Radio,
} from 'lucide-react';

const CATEGORY_TABS = [
  { label: 'All Events', value: 'ALL' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Hackathons', value: 'HACKATHON' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Workshops', value: 'WORKSHOP' },
  { label: 'Sports', value: 'SPORTS' },
];

export default function LandingPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      let url = '/events?limit=6';
      if (selectedCategory !== 'ALL') {
        url += `&category=${selectedCategory}`;
      }
      const res = await apiFetch<CampusEvent[]>(url);
      if (res.success && res.data) {
        setEvents(res.data);
      }
      setLoading(false);
    }
    loadEvents();
  }, [selectedCategory]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-10 overflow-hidden campus-grid-pattern">
        {/* Soft background ambient gradient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[320px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Live Campus Notice Ticker */}
          <div className="mb-6 flex items-center justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-indigo-300 font-bold">EVENTRA</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Campus Events & Digital Entry</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">Siddaganga Institute of Technology</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Hero Narrative & Primary CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Campus Events, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                  Digitized & Verified.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover campus events, reserve your place, manage digital tickets, and verify entry through one secure platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/events"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow-indigo flex items-center justify-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Discover Campus Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/gate/validate"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-emerald-400 font-semibold text-xs sm:text-sm border border-emerald-500/30 shadow-glow-emerald flex items-center justify-center gap-2 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open Gate Verification</span>
                </Link>
              </div>

              {/* Product Capabilities (Truthful product facts, zero unmeasured claims) */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-white uppercase">Event Discovery</p>
                  <p className="text-[11px] text-slate-400">Find upcoming campus events</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-indigo-400 uppercase">Digital Tickets</p>
                  <p className="text-[11px] text-slate-400">Access your registered event passes</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-emerald-400 uppercase">Secure Entry</p>
                  <p className="text-[11px] text-slate-400">Verify tickets at the event gate</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase">Organizer Tools</p>
                  <p className="text-[11px] text-slate-400">Create and manage campus events</p>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive 3D Digital Pass Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <HologramTicketHero />
            </div>
          </div>
        </div>
      </section>

      {/* Campus Event Discovery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              SIT Active Event Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Upcoming Campus Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Silver Jubilee Auditorium, Media Center, CS/IS Labs, and SIT Sports Stadium.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === tab.value
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real Seeded Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-3 border border-slate-800">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No Events in this Category</h3>
            <p className="text-xs text-slate-400">Select another category or view all published events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition"
          >
            <span>View All Campus Events in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>
      </section>

      {/* Campus Event Platform Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            End-to-End Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How EVENTRA Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A unified platform for event organizers, attendees, and gate staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Organizer Studio */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-glow-indigo">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Stage 01 • Organizers
              </span>
              <h3 className="text-lg font-bold text-white">Organizer Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Define venue capacities, schedules, and event banners. Access live registration metrics and attendee check-in rates.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/organizer/dashboard"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
              >
                <span>Launch Organizer Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Digital Passes */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-glow-emerald">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Stage 02 • Student Portal
              </span>
              <h3 className="text-lg font-bold text-white">Digital Event Passes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reserve your place at campus events and receive an instant digital pass with QR verification and complete event details.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Gate Verification */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                Stage 03 • Gate Checkpoint
              </span>
              <h3 className="text-lg font-bold text-white">Gate Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant gate check-in terminal with audio feedback and duplicate entry prevention for venue access.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/gate/validate"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
              >
                <span>Access Gate Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Deployment Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel-elevated p-8 sm:p-10 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Campus Event Infrastructure
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Deployed for Siddaganga Institute of Technology
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage registrations, issue digital passes, and streamline gate check-ins across
              Silver Jubilee Auditorium, Media Center, CS Labs, and campus venues.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/events"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo transition"
            >
              Explore Events
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              Sign In / Switch Role
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
