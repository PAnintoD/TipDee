'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Building2,
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Trash2,
} from 'lucide-react';

export default function AgencyPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [agency, setAgency] = useState<{ name: string; streamers: any[] } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newStreamerUsername, setNewStreamerUsername] = useState('');
  const [newStreamerName, setNewStreamerName] = useState('');
  const [newRevShare, setNewRevShare] = useState(10);

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;
    setAgency({
      name: newAgencyName.trim(),
      streamers: [
        {
          username,
          name: (session?.user as any)?.name || username,
          revShare: 0,
          totalIncome: 0,
        },
      ],
    });
    setShowCreateModal(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !newStreamerUsername.trim()) return;
    setAgency({
      ...agency,
      streamers: [
        ...agency.streamers,
        {
          username: newStreamerUsername.toLowerCase().trim(),
          name: newStreamerName.trim() || newStreamerUsername,
          revShare: Number(newRevShare),
          totalIncome: 0,
        },
      ],
    });
    setNewStreamerUsername('');
    setNewStreamerName('');
    setShowAddMemberModal(false);
  };

  const totalAgencyRevenue = agency ? agency.streamers.reduce((sum, s) => sum + (s.totalIncome || 0), 0) : 0;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Building2 className="h-6 w-6 text-brand-400" />
                <span>ขอเปิดสังกัด & จัดการสังกัด (Agency & Esports Teams)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ระบบดูแลสตรีมเมอร์ในสังกัด รวมยอดรายได้ และแบ่งส่วนแบ่งคอมมิชชัน
              </p>
            </div>

            {agency ? (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>เชิญสตรีมเมอร์เข้าสังกัด</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>ขอเปิดสังกัดใหม่</span>
              </button>
            )}
          </div>

          {!agency ? (
            <div className="p-12 rounded-3xl border border-white/10 bg-[#0e1219]/90 text-center space-y-3">
              <Building2 className="h-12 w-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">คุณยังไม่ได้เปิดสังกัด</h3>
              <p className="text-xs text-slate-400">
                หากคุณเป็นเจ้าของทีม Esports หรือ Agency สามารถขอเปิดสังกัดเพื่อดูแลสตรีมเมอร์หลายคนได้
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs transition-all shadow-md"
                >
                  + ขอเปิดสังกัดใหม่
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Agency Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
                  <span className="text-xs text-slate-400">ชื่อสังกัด</span>
                  <p className="text-xl font-black text-white">{agency.name}</p>
                  <p className="text-[11px] text-brand-400 font-semibold">สถานะ: ยืนยันทางการแล้ว (Verified)</p>
                </div>

                <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
                  <span className="text-xs text-slate-400">ยอดเงินรวมทุกช่องในสังกัด</span>
                  <p className="text-2xl font-black text-white">
                    {totalAgencyRevenue.toLocaleString('th-TH')} <span className="text-sm font-bold text-brand-400">฿</span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium">รวม {agency.streamers.length} ช่องสตรีมเมอร์</p>
                </div>

                <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
                  <span className="text-xs text-slate-400">สตรีมเมอร์ในสังกัด</span>
                  <p className="text-2xl font-black text-white">
                    {agency.streamers.length} <span className="text-sm font-bold text-slate-400">คน</span>
                  </p>
                  <p className="text-[11px] text-slate-500">สมาชิกสตรีมเมอร์</p>
                </div>
              </div>

              {/* Streamers in Agency Table */}
              <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-400" />
                    <h3 className="text-base font-bold text-white">รายชื่อสตรีมเมอร์ในสังกัด</h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">สตรีมเมอร์</th>
                        <th className="px-5 py-3.5 font-bold">Username</th>
                        <th className="px-5 py-3.5 font-bold">ส่วนแบ่งสังกัด (Rev Share)</th>
                        <th className="px-5 py-3.5 font-bold text-right">ยอดโดเนทสะสม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {agency.streamers.map((s) => (
                        <tr key={s.username} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white">{s.name}</td>
                          <td className="px-5 py-3.5 text-brand-400 font-mono">@{s.username}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-300">{s.revShare}%</td>
                          <td className="px-5 py-3.5 text-right font-black text-sm text-white">
                            {s.totalIncome.toLocaleString('th-TH')} ฿
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Create Agency Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white">ขอเปิดสังกัดใหม่</h3>
                <form onSubmit={handleCreateAgency} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ชื่อสังกัด (Agency / Esports Name)</label>
                    <input
                      type="text"
                      value={newAgencyName}
                      onChange={(e) => setNewAgencyName(e.target.value)}
                      placeholder="เช่น CyberStream Esports"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-500 text-black font-bold text-xs"
                    >
                      สร้างสังกัด
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white">เชิญสตรีมเมอร์เข้าสังกัด</h3>
                <form onSubmit={handleAddMember} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Username สตรีมเมอร์</label>
                    <input
                      type="text"
                      value={newStreamerUsername}
                      onChange={(e) => setNewStreamerUsername(e.target.value)}
                      placeholder="เช่น myfriend"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ชื่อที่แสดง</label>
                    <input
                      type="text"
                      value={newStreamerName}
                      onChange={(e) => setNewStreamerName(e.target.value)}
                      placeholder="เช่น MyFriend Live"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ส่วนแบ่งสังกัด (% Commission)</label>
                    <input
                      type="number"
                      value={newRevShare}
                      onChange={(e) => setNewRevShare(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-500 text-black font-bold text-xs"
                    >
                      เพิ่มเข้าสังกัด
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
