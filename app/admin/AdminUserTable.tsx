'use client';

import React, { useState } from 'react';
import { Users, Search, Ban, CheckCircle, Trash2, ExternalLink, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

interface AdminUserTableProps {
  initialUsers: any[];
  currentUserId: string;
}

export function AdminUserTable({ initialUsers, currentUserId }: AdminUserTableProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.streamer?.username?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.active) ||
      (statusFilter === 'BANNED' && !u.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleActive = async (user: any) => {
    if (user.id === currentUserId) {
      alert('ไม่สามารถระงับบัญชีของตนเองได้');
      return;
    }
    const newActiveState = !user.active;
    const confirmMsg = newActiveState
      ? `คุณต้องการปลดแบนผู้ใช้ ${user.email} ใช่หรือไม่?`
      : `คุณต้องการระงับการใช้งาน (Ban) ผู้ใช้ ${user.email} ใช่หรือไม่?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActiveState }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: newActiveState } : u))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (user: any) => {
    if (user.id === currentUserId) {
      alert('ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้');
      return;
    }
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`เปลี่ยนสิทธิ์ ${user.email} เป็น ${newRole}?`)) return;

    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: any) => {
    if (user.id === currentUserId) {
      alert('ไม่สามารถลบบัญชีของตนเองได้');
      return;
    }
    if (!confirm(`⚠️ ยืนยันการลบบัญชี ${user.email} ถาวร?`)) return;

    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">จัดการบัญชีผู้ใช้งาน (User Management)</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">ทั้งหมด {filteredUsers.length} รายการ</span>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาอีเมล, ชื่อ, username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
          >
            <option value="ALL">สิทธิ์ทั้งหมด (All Roles)</option>
            <option value="USER">ผู้ใช้ทั่วไป (USER)</option>
            <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
          >
            <option value="ALL">สถานะทั้งหมด (All Status)</option>
            <option value="ACTIVE">ปกติ (Active)</option>
            <option value="BANNED">ระงับการใช้งาน (Banned)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-5 py-3.5">ผู้ใช้</th>
                <th className="px-5 py-3.5">ช่องสตรีมเมอร์</th>
                <th className="px-5 py-3.5">สิทธิ์</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5">วันที่สร้าง</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isLoading = actionLoading === u.id;
                  const isCurrent = u.id === currentUserId;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                            {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold">{u.name || 'ไม่ระบุชื่อ'}</p>
                            <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {u.streamer ? (
                          <Link
                            href={`/u/${u.streamer.username}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-mono font-semibold"
                          >
                            <span>@{u.streamer.username}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">- ยังไม่มีช่อง -</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={isCurrent || isLoading}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          } disabled:opacity-50 shadow-2xs`}
                          title="คลิกเพื่อสลับสิทธิ์ USER <-> ADMIN"
                        >
                          {u.role}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            u.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {u.active ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Active
                            </>
                          ) : (
                            <>
                              <Ban className="h-3 w-3" /> Banned
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                        {new Date(u.createdAt).toLocaleDateString('th-TH')}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ban / Unban Toggle */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isCurrent || isLoading}
                            className={`p-1.5 rounded-lg border text-xs transition-colors shadow-2xs ${
                              u.active
                                ? 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            } disabled:opacity-30`}
                            title={u.active ? 'ระงับการใช้งาน (Ban)' : 'ปลดแบน (Unban)'}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isCurrent || isLoading}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors disabled:opacity-30 shadow-2xs"
                            title="ลบผู้ใช้นี้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
