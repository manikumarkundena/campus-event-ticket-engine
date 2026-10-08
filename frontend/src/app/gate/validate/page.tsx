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
  Volume2,
  VolumeX,
  Scan,
  RefreshCw,
  Radio,
  Building,
} from 'lucide-react';

export default function GateValidatePage() {
  const { user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeCheckpoint, setActiveCheckpoint] = useState('Gate 01 • Main Quadrangle');
  const [validCount, setValidCount] = useState(0);
  const [deniedCount, setDeniedCount] = useState(0);

  useEffect(() => {
    loadRecentScans();
  }, []);

  async function loadRecentScans() {
    const res = await apiFetch<any[]>('/validation/recent');
    if (res.success && res.data) {
      setRecentScans(res.data);
      // derive session stats
      const valid = res.data.filter((s) => s.status === 'USED' || s.validatedAt).length;
      setValidCount(valid);
    }
  }

  // Audio feedback synthesizer using native Web Audio API
  const playSound = (type: 'VALID' | 'ALREADY_USED' | 'INVALID') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'VALID') {
        // High pleasant dual chime
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'ALREADY_USED') {
        // Warning dual buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(260, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Low error buzz
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // AudioContext unavailable
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
        entryNotes: `Scanned at ${activeCheckpoint} by ${user?.name || 'Gate Officer'}`,
      }),
    });

    setVerifying(false);

    if (res.success && res.data) {
      setResult(res.data);
      if (res.data.result === 'VALID') {
        setValidCount((c) => c + 1);
      } else {
        setDeniedCount((c) => c + 1);
      }
      playSound(res.data.result as any);
      loadRecentScans();
    } else {
      const errResult: ValidationResult = {
        result: 'INVALID',
        message: res.error || 'Ticket verification failed or unrecognized token',
      };
      setResult(errResult);
      setDeniedCount((c) => c + 1);
      playSound('INVALID');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Turnstile Kiosk Command Header */}
      <div className="glass-panel-elevated p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-glow-emerald">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                SIT Campus Security Turnstile
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-mono">Terminal #01 Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Turnstile Access Control
            </h1>
            <p className="text-xs text-slate-300">
              Officer On Duty: <span className="text-white font-semibold">{user?.name || 'Gate Staff'}</span>
              {' '}({user?.department || 'Campus Security Operations'})
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>LIVE CLOUD LINK</span>
            </div>

            {/* Checkpoint selector & sound toggle */}
            <div className="flex items-center gap-2">
              <select
                value={activeCheckpoint}
                onChange={(e) => setActiveCheckpoint(e.target.value)}
                aria-label="Select Gate Checkpoint"
                className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="Gate 01 • Main Quadrangle">Gate 01 • Main Quadrangle</option>
                <option value="Gate 02 • Birla Auditorium">Gate 02 • Birla Auditorium</option>
                <option value="Gate 03 • CS Block Turnstile">Gate 03 • CS Block Turnstile</option>
                <option value="Gate 04 • Sports Stadium">Gate 04 • Sports Stadium</option>
              </select>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute turnstile audio cues' : 'Enable turnstile audio cues'}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Counters Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Approved Entries</span>
            <p className="text-xl font-bold font-mono text-emerald-400">{validCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Access Denied / Used</span>
            <p className="text-xl font-bold font-mono text-amber-400">{deniedCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Current Checkpoint</span>
            <p className="text-xs font-semibold text-white truncate">{activeCheckpoint.split('•')[1] || activeCheckpoint}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Turnstile Status</span>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE ARMED
            </p>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Viewfinder Graphic & Scanner Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-400" />
                Optical Camera & Token Reader
              </span>
              <span className="text-[10px] font-mono text-slate-500">Auto-Focus Ready</span>
            </div>

            {/* Viewfinder simulation canvas */}
            <div className="relative w-full h-48 rounded-2xl bg-slate-950/90 border border-emerald-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Corner reticle brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />

              {/* Sweeping laser line animation */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse" />

              <div className="space-y-2 text-center z-10 pointer-events-none">
                <QrCode className="w-12 h-12 text-emerald-400/60 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400 font-mono">Present Student QR Code or Enter Pass ID Below</p>
              </div>

              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500">
                1080p • 60 FPS
              </div>
            </div>

            {/* Input Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Scan QR Token or Enter Ticket Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder="e.g. TKT-SIT-TH01 or paste QR payload..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={verifying || !identifier.trim()}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <span>{verifying ? 'Verifying...' : 'Validate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Demo Fast Verification Shortcuts */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulation Verification Presets:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setIdentifier('TKT-SIT-TH01');
                    handleVerify('TKT-SIT-TH01');
                  }}
                  className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-left transition group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Valid Pass</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-SIT-TH01</p>
                </button>

                <button
                  onClick={() => {
                    setIdentifier('TKT-SIT-TH02');
                    handleVerify('TKT-SIT-TH02');
                  }}
                  className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-left transition group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Already Scanned</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-SIT-TH02</p>
                </button>

                <button
                  onClick={() => {
                    setIdentifier('TKT-INVALID-CODE');
                    handleVerify('TKT-INVALID-CODE');
                  }}
                  className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-left transition group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Forged / Bad</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">TKT-INVALID-CODE</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Decision Output Banner */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div
              className={`rounded-3xl p-6 sm:p-7 border shadow-2xl transition-all duration-300 space-y-5 ${
                result.result === 'VALID'
                  ? 'bg-emerald-950/50 border-emerald-500/60 shadow-glow-emerald text-emerald-100'
                  : result.result === 'ALREADY_USED'
                  ? 'bg-amber-950/50 border-amber-500/60 shadow-glow-amber text-amber-100'
                  : 'bg-rose-950/50 border-rose-500/60 shadow-glow-rose text-rose-100'
              }`}
            >
              {/* Giant Verdict Icon & Badge */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    result.result === 'VALID'
                      ? 'bg-emerald-500 text-slate-950'
                      : result.result === 'ALREADY_USED'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {result.result === 'VALID' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : result.result === 'ALREADY_USED' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                      result.result === 'VALID'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        : result.result === 'ALREADY_USED'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {result.result === 'VALID'
                      ? 'ACCESS GRANTED'
                      : result.result === 'ALREADY_USED'
                      ? 'PASS DUPLICATE'
                      : 'ACCESS DENIED'}
                  </span>
                  <h2 className="text-xl font-extrabold text-white leading-tight">{result.message}</h2>
                </div>
              </div>

              {/* Attendee Profile Info */}
              {result.attendee ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400">Student Attendee</span>
                      <p className="font-bold text-white text-sm">{result.attendee.name}</p>
                      <p className="text-indigo-400 font-mono text-xs">{result.attendee.usn || '1SI22CS101'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Department</span>
                      <p className="text-slate-300 font-medium">{result.attendee.department || 'CSE'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Approved Event</span>
                    <p className="font-semibold text-white">{result.event?.title}</p>
                    <p className="text-slate-400 text-[11px]">{result.event?.venue}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Pass Code</span>
                    <span className="text-emerald-400 font-bold">{result.ticket?.ticketCode}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <p>No valid attendee record linked to this code in the database.</p>
                </div>
              )}
            </div>
          ) : (
            /* Standby Card */
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3 h-full flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">Turnstile Ready</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Waiting for scan input. Point turnstile laser reader at pass QR code or click a test shortcut.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Gate Validations Stream Table */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Turnstile Entry Log Feed
          </h3>
          <button
            onClick={loadRecentScans}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>

        {recentScans.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No gate entries logged in this session yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Pass Code</th>
                  <th className="py-2.5 px-3">Attendee</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Verified By</th>
                  <th className="py-2.5 px-3 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                      {scan.validatedAt ? new Date(scan.validatedAt).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{scan.ticketCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {scan.booking?.user?.name || 'Student'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                      {scan.booking?.event?.title || 'Campus Event'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {scan.validatedBy?.name || 'Gate Staff'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        CLEARED
                      </span>
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
