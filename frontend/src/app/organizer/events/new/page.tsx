'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Calendar, Sparkles, ArrowLeft, ArrowRight, AlertCircle, Wand2, ShieldCheck } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    venue: '',
    startDateTime: '',
    endDateTime: '',
    totalCapacity: 100,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Event Assistant (Section 51 requirement: optional, assists description & formatting)
  const handleAIAssist = () => {
    if (!formData.title) {
      setError('Please enter a basic event title first to generate AI suggestions.');
      return;
    }
    setError('');
    setAiGenerating(true);

    setTimeout(() => {
      const titleLower = formData.title.toLowerCase();
      let generatedDesc = '';
      let recommendedCategory = formData.category;

      if (titleLower.includes('hack') || titleLower.includes('code') || titleLower.includes('tech')) {
        recommendedCategory = 'HACKATHON';
        generatedDesc = `${formData.title} brings together visionary students and engineers across Karnataka to build transformative solutions.\n\nTracks include:\n• Autonomous Artificial Intelligence & Agentic Workflows\n• Cloud-Native DevOps & Cyber-Physical Security\n• CleanTech & Sustainable Campus Solutions\n\nMentorship by industry leaders, cloud credits, and cash awards for winning teams. Food, refreshments, and high-speed campus WiFi provided.`;
      } else if (titleLower.includes('dance') || titleLower.includes('music') || titleLower.includes('cultural') || titleLower.includes('fest')) {
        recommendedCategory = 'CULTURAL';
        generatedDesc = `Experience the vibrant spirit of SIT at ${formData.title}!\n\nFeaturing electrifying stage performances, competitive showcases, and special guest appearances. Open to all students, faculty, and invited college delegations.\n\nEntry requires this verified digital pass at campus auditorium turnstiles.`;
      } else if (titleLower.includes('cricket') || titleLower.includes('sports') || titleLower.includes('football')) {
        recommendedCategory = 'SPORTS';
        generatedDesc = `Annual inter-departmental championship for ${formData.title} at SIT Sports Stadium.\n\nCompete for the championship cup and certificates of excellence. High-energy matches, professional referees, and campus commentary.`;
      } else {
        recommendedCategory = 'WORKSHOP';
        generatedDesc = `An intensive hands-on session on ${formData.title}.\n\nKey Takeaways:\n• Core fundamentals and modern industry practices\n• Interactive live coding and demonstration\n• Q&A session with distinguished resource persons\n• Certificate of completion for all verified attendees.`;
      }

      setFormData((prev) => ({
        ...prev,
        category: recommendedCategory,
        description: generatedDesc,
      }));
      setAiGenerating(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        totalCapacity: Number(formData.totalCapacity),
      }),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      router.push(`/events/${res.data.id}`);
    } else {
      setError(res.error || 'Failed to publish event');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Studio</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
          Create & Publish Event
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Campus Event</h1>
          <p className="text-xs text-slate-400">
            Publish a new campus event with automated capacity allocation and digital ticketing.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. SIT AI & DevOps Symposium 2026"
              required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="TECHNICAL">Technical</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="CULTURAL">Cultural</option>
                <option value="SPORTS">Sports</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Silver Jubilee Auditorium, SIT"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Total Capacity</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value, 10) || 1 })}
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Banner Image URL</label>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Detailed Description</label>
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={aiGenerating}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition font-medium"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{aiGenerating ? 'AI Generating...' : '✨ Polish with AI Event Assistant'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide event details, schedule highlights, prerequisites, and prizes..."
              required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link
              href="/organizer/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center gap-2 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Publishing Event...' : 'Publish Event'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
