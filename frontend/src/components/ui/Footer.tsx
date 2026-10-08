import React from 'react';
import { Ticket, ShieldCheck, Cpu, GitBranch, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Institute & Project Identity */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow-indigo">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">Campus Event Ticketing Engine</span>
              <p className="text-xs text-indigo-400 font-medium">Siddaganga Institute of Technology, Tumakuru</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            An enterprise-grade, concurrency-safe campus event management and digital ticketing platform. Built for
            Course <span className="text-slate-200 font-medium">Activity Based Learning – 1</span> (Software Project
            Management: Practical Approach using DevOps Tools), Academic Micro-Project 2026–27.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> ACID Concurrency
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <Cpu className="w-3 h-3 text-indigo-400" /> Docker & Kubernetes Ready
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <GitBranch className="w-3 h-3 text-violet-400" /> Jenkins CI/CD Pipeline
            </span>
          </div>
        </div>

        {/* Col 2: System Capabilities */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Role Portals</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/events" className="hover:text-white transition">
                Event Discovery & Catalog
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-white transition">
                Student Self-Service Portal
              </a>
            </li>
            <li>
              <a href="/organizer/dashboard" className="hover:text-white transition">
                Organizer Event Studio
              </a>
            </li>
            <li>
              <a href="/gate/validate" className="hover:text-emerald-400 transition text-emerald-500 font-medium">
                Gate QR Verification Scanner
              </a>
            </li>
            <li>
              <a href="/admin/dashboard" className="hover:text-white transition">
                Administrative Audit Console
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Academic Credits */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Academic Project</h4>
          <div className="text-sm space-y-1.5 text-slate-400">
            <p className="text-slate-200 font-medium">Department of Information Science & Engineering</p>
            <p>Siddaganga Institute of Technology</p>
            <p>B.H. Road, Tumakuru, Karnataka 572103</p>
            <div className="pt-3">
              <span className="text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-1 rounded font-mono">
                Course: SPM ABL-1 (2026–27)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026–2027 Siddaganga Institute of Technology. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Engineered with Next.js, Express, TypeScript, Prisma & PostgreSQL</p>
      </div>
    </footer>
  );
}
