'use client';

import React, { useEffect, useState } from 'react';
import { EventCard } from '@/components/ui/EventCard';
import { CampusEvent, EventCategory } from '@/types';
import { apiFetch } from '@/lib/api';
import { Search, Calendar, Filter, Sparkles } from 'lucide-react';

const CATEGORIES: Array<{ label: string; value: string }> = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Hackathons', value: 'HACKATHON' },
  { label: 'Workshops', value: 'WORKSHOP' },
  { label: 'Sports', value: 'SPORTS' },
];

export default function EventsCatalogPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, [category]);

  async function fetchEvents(searchQuery?: string) {
    setLoading(true);
    let endpoint = `/events?status=PUBLISHED`;
    if (category !== 'ALL') {
      endpoint += `&category=${category}`;
    }
    if (searchQuery) {
      endpoint += `&search=${encodeURIComponent(searchQuery)}`;
    }

    const res = await apiFetch<CampusEvent[]>(endpoint);
    if (res.success && res.data) {
      setEvents(res.data);
    }
    setLoading(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SIT Campus Discovery Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Campus Events
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Reserve your seat for upcoming technical symposiums, cultural nights, hackathons, and guest lectures
          at Siddaganga Institute of Technology.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, venue, or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </form>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === cat.value
                  ? 'bg-indigo-600 text-white shadow-glow-indigo'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 border border-slate-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-lg">No Events Found</h3>
          <p className="text-xs text-slate-400">
            No events match your current filter criteria. Try searching with different terms or select all categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-glow-indigo"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
