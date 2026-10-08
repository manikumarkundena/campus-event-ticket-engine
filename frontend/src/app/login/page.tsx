'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError('');
    setSubmitting(true);
    await switchDemoRole(role);
    setSubmitting(false);

    if (role === 'GATE_STAFF') {
      router.push('/gate/validate');
    } else if (role === 'ORGANIZER') {
      router.push('/organizer/dashboard');
    } else if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-glow-indigo">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wider">Welcome to EVENTRA</h1>
          <p className="text-xs text-slate-400">Campus Events & Digital Entry • Siddaganga Institute of Technology</p>
        </div>

        {/* Demo Fast Login Box */}
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <UserCheck className="w-4 h-4" />
            <span>Select Demo Role to Sign In:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('STUDENT')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-left"
            >
              🎓 <span className="font-semibold">Student</span>
              <p className="text-[10px] text-slate-400">Raghavendra (CSE)</p>
            </button>
            <button
              onClick={() => handleQuickDemo('ORGANIZER')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-left"
            >
              🎪 <span className="font-semibold">Organizer</span>
              <p className="text-[10px] text-slate-400">Prof. Kiran (IEEE)</p>
            </button>
            <button
              onClick={() => handleQuickDemo('GATE_STAFF')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 transition text-left"
            >
              🛡️ <span className="font-semibold">Gate Staff</span>
              <p className="text-[10px] text-emerald-400/80">Gate Checkpoint</p>
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 transition text-left"
            >
              👑 <span className="font-semibold">Admin</span>
              <p className="text-[10px] text-purple-400/80">Dean Welfare</p>
            </button>
          </div>
        </div>

        {/* Regular Sign-In Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Campus Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@sit.ac.in"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don’t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
