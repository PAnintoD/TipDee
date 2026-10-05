'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';

export default function AgencyPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [agency, setAgency] = useState<{ name: string; streamers: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newStreamerUsername, setNewStreamerUsername] = useState('');
  const [newStreamerName, setNewStreamerName] = useState('');
  const [newRevShare, setNewRevShare] = useState(10);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`/api/streamer?id=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.agencySettings) {
          setAgency(data.data.agencySettings);
        }
      })
      .catch((e) => console.error('Failed to load agency', e))
      .finally(() => setLoading(false));
  }, [username]);

  const saveAgencyToDb = async (updatedAgency: any) => {
    try {
      await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: username,
          agencySettings: updatedAgency,
        }),
      });
      setSavedSuccessMsg('บันทึกข้อมูลสังกัดเรียบร้อยแล้ว');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to save agency', e);
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;

    const newAgency = {
      name: newAgencyName.trim(),
      streamers: [
        {
          username,
          name: (session?.user as any)?.name || username,
          revShare: 0,
          totalIncome: 0,
        },
      ],
    };

    setAgency(newAgency);
    await saveAgencyToDb(newAgency);
    setShowCreateModal(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !newStreamerUsername.trim()) return;

    const newAgency = {
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
    };

    setAgency(newAgency);
    await saveAgencyToDb(newAgency);

    setNewStreamerUsername('');
    setNewStreamerName('');
    setShowAddMemberModal(false);
  };

  const handleRemoveMember = async (streamerUsername: string) => {
    if (!agency) return;
    const newAgency = {
      ...agency,
      streamers: agency.streamers.filter((s) => s.username !== streamerUsername),
    };
    setAgency(newAgency);
    await saveAgencyToDb(newAgency);
  };

  const totalAgencyRevenue = agency ? agency.streamers.reduce((sum, s) => sum + (s.totalIncome || 0), 0) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Building2 className="h-6 w-6 text-emerald-600" />
                <span>ขอเปิดสังกัด & จัดการสังกัด (Agency & Esports Teams)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ระบบดูแลสตรีมเมอร์ในสังกัด รวมยอดรายได้ และแบ่งส่วนแบ่งคอมมิชชัน
              </p>
            </div>

            {agency ? (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>เชิญสตรีมเมอร์เข้าสังกัด</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>สร้างสังกัดใหม่</span>
              </button>
            )}
          </div>

          {savedSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
            </div>
          ) : !agency ? (
            <div className="p-12 rounded-2xl border border-slate-200/80 bg-white text-center space-y-4 shadow-sm">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">คุณยังไม่มีสังกัด (Agency Profile)</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                เปิดสังกัดเพื่อรวมยอดรายได้ของสตรีมเมอร์ในทีม หักส่วนแบ่งอัตโนมัติ และดูรายงานสรุปแบบทีม Esports
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                >
                  เปิดสังกัดใหม่ทันที
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Agency Overview Header */}
              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{agency.name}</h2>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                      <ShieldCheck className="h-3 w-3" /> สังกัดได้รับการรับรอง (Verified Agency)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-slate-500">สตรีมเมอร์ในสังกัด</span>
                    <p className="text-lg font-bold text-slate-900">{agency.streamers.length} ช่อง</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">รายได้รวมของสังกัด</span>
                    <p className="text-lg font-bold text-emerald-600">
                      {totalAgencyRevenue.toLocaleString('th-TH')} ฿
                    </p>
                  </div>
                </div>
              </div>

              {/* Streamers List in Agency */}
              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">รายชื่อสตรีมเมอร์ในสังกัด</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 pb-2">
                        <th className="py-2.5 font-semibold">ชื่อช่อง</th>
                        <th className="py-2.5 font-semibold">Username</th>
                        <th className="py-2.5 font-semibold">ส่วนแบ่งสังกัด</th>
                        <th className="py-2.5 font-semibold">ยอดโดเนทสะสม</th>
                        <th className="py-2.5 font-semibold text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agency.streamers.map((s) => (
                        <tr key={s.username} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900">{s.name}</td>
                          <td className="py-3 font-mono text-slate-500">@{s.username}</td>
                          <td className="py-3 text-emerald-600 font-semibold">{s.revShare}%</td>
                          <td className="py-3 font-bold text-slate-900">
                            {(s.totalIncome || 0).toLocaleString('th-TH')} ฿
                          </td>
                          <td className="py-3 text-right">
                            {s.username !== username && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(s.username)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="ลบออกจากสังกัด"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-900">เปิดสังกัดใหม่</h3>
                <form onSubmit={handleCreateAgency} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสังกัด / ชื่อทีม Esports</label>
                    <input
                      type="text"
                      value={newAgencyName}
                      onChange={(e) => setNewAgencyName(e.target.value)}
                      placeholder="เช่น MiTH, Bacon Time, Talon"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                    >
                      ยืนยันสร้างสังกัด
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-900">เชิญสตรีมเมอร์เข้าสังกัด</h3>
                <form onSubmit={handleAddMember} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ใช้ TipDee ของสตรีมเมอร์</label>
                    <input
                      type="text"
                      value={newStreamerUsername}
                      onChange={(e) => setNewStreamerUsername(e.target.value)}
                      placeholder="เช่น streamerza"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อที่แสดงในสังกัด</label>
                    <input
                      type="text"
                      value={newStreamerName}
                      onChange={(e) => setNewStreamerName(e.target.value)}
                      placeholder="เช่น กอล์ฟ Gamer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ส่วนแบ่งสังกัด (%)</label>
                    <input
                      type="number"
                      value={newRevShare}
                      onChange={(e) => setNewRevShare(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
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
