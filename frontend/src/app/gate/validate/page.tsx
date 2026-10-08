'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { ValidationResult } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  History,
} from 'lucide-react';

export default function GateValidatePage() {
  const { user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  async function loadRecentScans() {
    const res = await apiFetch<any[]>('/validation/recent');
    if (res.success && res.data) {
      setRecentScans(res.data);
    }
  }

  // Audio feedback synthesizer using native Web Audio API (no external asset dependencies!)
  const playSound = (type: 'VALID' | 'ALREADY_USED' | 'INVALID') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'VALID') {
        // High pleasant ding
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'ALREADY_USED') {
        // Double warning buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Low error buzz
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || identifier).trim();
    if (!targetCode) return;

    setVerifying(true);
    setResult(null);

    const res = await apiFetch<ValidationResult>('/validation/verify', {
      method: 'POST',
      body: JSON.stringify({
        ticketIdentifier: targetCode,
        entryNotes: `Gate scanned by ${user?.name || 'Gate Officer'}`,
      }),
    });

    setVerifying(false);

    if (res.success && res.data) {
      setResult(res.data);
      playSound(res.data.result as any);
      loadRecentScans();
    } else {
      const errResult: ValidationResult = {
        result: 'INVALID',
        message: res.error || 'Ticket verification failed',
      };
      setResult(errResult);
      playSound('INVALID');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-glow-emerald">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Gate Security Turnstile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">QR & Ticket Verification</h1>
          <p className="text-xs text-slate-400">
            Operator: <span className="text-slate-200 font-semibold">{user?.name || 'Security Officer'}</span> (Gate 1 Terminal)
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-bold text-center">
          SYSTEM ACTIVE • REALTIME
        </div>
      </div>

      {/* Main Scanner Input Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Scan QR Code Token or Enter Ticket Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="e.g. TKT-SIT-TH01 or paste QR payload token..."
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={verifying || !identifier.trim()}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-2 transition disabled:opacity-50"
            >
              <span>{verifying ? 'Scanning...' : 'Verify Entry'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Fast Verification Shortcuts */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fast Demo Verification Shortcuts:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                setIdentifier('TKT-SIT-TH01');
                handleVerify('TKT-SIT-TH01');
              }}
              className="p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 text-left transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Test VALID Pass</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-SIT-TH01 (Student 1)</p>
            </button>

            <button
              onClick={() => {
                setIdentifier('TKT-SIT-TH02');
                handleVerify('TKT-SIT-TH02');
              }}
              className="p-3 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Test ALREADY USED</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-SIT-TH02 (Used 2h ago)</p>
            </button>

            <button
              onClick={() => {
                setIdentifier('TKT-FAKE-CODE-999');
                handleVerify('TKT-FAKE-CODE-999');
              }}
              className="p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-left transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Test INVALID Pass</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-FAKE-CODE-999</p>
            </button>
          </div>
        </div>
      </div>

      {/* Massive Status Feedback Display */}
      {result && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-300 ${
            result.result === 'VALID'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-emerald text-emerald-200'
              : result.result === 'ALREADY_USED'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-glow-amber text-amber-200'
              : 'bg-rose-950/40 border-rose-500/50 shadow-glow-rose text-rose-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                result.result === 'VALID'
                  ? 'bg-emerald-500 text-slate-950'
                  : result.result === 'ALREADY_USED'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {result.result === 'VALID' ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : result.result === 'ALREADY_USED' ? (
                <AlertTriangle className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${
                    result.result === 'VALID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : result.result === 'ALREADY_USED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.result === 'VALID'
                    ? '✅ ENTRY APPROVED'
                    : result.result === 'ALREADY_USED'
                    ? '⚠️ DUPLICATE ENTRY BLOCKED'
                    : '❌ ACCESS DENIED'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white">{result.message}</h2>

              {/* Attendee Details Card */}
              {result.attendee && (
                <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Attendee</span>
                    <p className="font-bold text-white text-sm">{result.attendee.name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{result.attendee.usn}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Event</span>
                    <p className="font-bold text-white text-sm">{result.event?.title}</p>
                    <p className="text-slate-400">{result.event?.venue}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Ticket Identifier</span>
                    <p className="font-mono font-bold text-indigo-400">{result.ticket?.ticketCode}</p>
                    <p className="text-slate-400 text-[10px]">Gate 1 Clearance</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Gate Validations Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          Recent Gate Entries Log
        </h3>

        {recentScans.length === 0 ? (
          <p className="text-xs text-slate-400">No gate entries recorded in this session yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Ticket Code</th>
                  <th className="py-2.5 px-3">Attendee</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                      {scan.validatedAt ? new Date(scan.validatedAt).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{scan.ticketCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {scan.booking?.user?.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                      {scan.booking?.event?.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {scan.validatedBy?.name || 'Gate Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
