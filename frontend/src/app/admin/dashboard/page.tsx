'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, AuditLogItem } from '@/types';
import {
  Shield,
  Users,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    const [usersRes, auditRes, statsRes] = await Promise.all([
      apiFetch<User[]>('/admin/users'),
      apiFetch<AuditLogItem[]>('/admin/audit?limit=25'),
      apiFetch<any>('/admin/stats'),
    ]);

    if (usersRes.success && usersRes.data) setUsers(usersRes.data);
    if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    setLoading(false);
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    const res = await apiFetch(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    });
    setUpdatingRole(null);

    if (res.success) {
      loadAdminData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Administration & Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration</h1>
          <p className="text-xs text-slate-400">
            Siddaganga Institute of Technology • Platform Administration
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
          <p className="text-3xl font-bold font-mono text-white">{stats?.users || 0}</p>
          <p className="text-[11px] text-slate-500">Across 4 security roles</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Published Events</span>
          <p className="text-3xl font-bold font-mono text-indigo-400">{stats?.events || 0}</p>
          <p className="text-[11px] text-slate-500">Active campus events</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Tickets Issued</span>
          <p className="text-3xl font-bold font-mono text-emerald-400">{stats?.tickets || 0}</p>
          <p className="text-[11px] text-slate-500">Unique digital tokens</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Audit Trail Events</span>
          <p className="text-3xl font-bold font-mono text-purple-400">{stats?.auditLogs || 0}</p>
          <p className="text-[11px] text-slate-500">Audited operations</p>
        </div>
      </div>

      {/* User Accounts & Role Management */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          User Accounts & Role Permissions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department / USN</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4 text-right">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {u.department || '—'} {u.usn ? `(${u.usn})` : ''}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-indigo-300 border border-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      disabled={updatingRole === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="ORGANIZER">ORGANIZER</option>
                      <option value="GATE_STAFF">GATE_STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Trail Log */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            System Audit Trail Log
          </h2>
          <span className="text-xs text-slate-400 font-mono">Immutable Log Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-indigo-300">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.entityType}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.user?.name || log.userId || 'SYSTEM'}</td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                    {log.metadata || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
