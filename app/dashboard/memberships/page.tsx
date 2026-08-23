'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Users,
  Crown,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Heart,
} from 'lucide-react';

export default function MembershipsPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [tiers, setTiers] = useState<any[]>([]);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState(50);
  const [newTierPerk, setNewTierPerk] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalMRR = tiers.reduce((sum, t) => sum + (t.price || 0) * (t.membersCount || 0), 0);
  const totalMembers = tiers.reduce((sum, t) => sum + (t.membersCount || 0), 0);

  const handleAddTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) return;
    setTiers([
      ...tiers,
      {
        id: String(Date.now()),
        name: newTierName.trim(),
        price: Number(newTierPrice),
        badge: '⭐',
        membersCount: 0,
        perks: newTierPerk ? newTierPerk.split('\n').filter((x) => x.trim()) : ['สิทธิ์สมาชิกพิเศษในช่อง'],
      },
    ]);
    setNewTierName('');
    setNewTierPerk('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Users className="h-6 w-6 text-brand-400" />
                <span>ระบบสมาชิกรายเดือน (Fan Memberships)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                สร้างระดับสมาชิกให้แฟนคลับสมัครรับสิทธิพิเศษและสนับสนุนช่องคุณอย่างต่อเนื่องทุกเดือน
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างระดับสมาชิกใหม่</span>
            </button>
          </div>

          {/* MRR Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">รายได้รายเดือนสะสม (MRR)</span>
              <p className="text-2xl font-black text-white">
                {totalMRR.toLocaleString('th-TH')} <span className="text-sm font-bold text-brand-400">฿ / เดือน</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">คำนวณจากสมาชิกที่ Active</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">จำนวนสมาชิกทั้งหมด</span>
              <p className="text-2xl font-black text-white">
                {totalMembers} <span className="text-sm font-bold text-slate-400">คน</span>
              </p>
              <p className="text-[11px] text-slate-500">แฟนคลับที่สนับสนุนรายเดือน</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-2">
              <span className="text-xs text-slate-400">ระดับสมาชิกที่เปิดรับ</span>
              <p className="text-2xl font-black text-white">
                {tiers.length} <span className="text-sm font-bold text-slate-400">ระดับ</span>
              </p>
              <p className="text-[11px] text-slate-500">Tier สมาชิกของช่องคุณ</p>
            </div>
          </div>

          {/* Tiers List */}
          {tiers.length === 0 ? (
            <div className="p-12 rounded-3xl border border-white/10 bg-[#0e1219]/90 text-center space-y-3">
              <Crown className="h-12 w-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">ยังไม่มีระดับสมาชิกของช่อง</h3>
              <p className="text-xs text-slate-400">
                คุณสามารถสร้างระดับสมาชิก Tier 1, 2, 3 เพื่อให้ผู้ชมสมัครสนับสนุนรายเดือนได้
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs transition-all shadow-md"
                >
                  + สร้างระดับสมาชิกแรก
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl flex flex-col justify-between space-y-4 relative group hover:border-brand-500/30 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{t.badge}</span>
                      <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-black">
                        {t.membersCount} สมาชิก
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{t.name}</h3>
                      <p className="text-2xl font-black text-white mt-1">
                        {t.price} <span className="text-xs text-slate-400 font-semibold">บาท / เดือน</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <p className="text-xs font-semibold text-slate-400">สิทธิพิเศษ:</p>
                      {t.perks.map((p: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setTiers(tiers.filter((x) => x.id !== t.id))}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="ลบระดับสมาชิกนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white">สร้างระดับสมาชิกใหม่</h3>
                <form onSubmit={handleAddTier} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ชื่อระดับ (Tier Name)</label>
                    <input
                      type="text"
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      placeholder="เช่น แฟนคลับตัวยง Tier 1"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ราคาต่อเดือน (บาท)</label>
                    <input
                      type="number"
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(Number(e.target.value))}
                      min={10}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">สิทธิพิเศษ (บรรทัดละ 1 ข้อ)</label>
                    <textarea
                      value={newTierPerk}
                      onChange={(e) => setNewTierPerk(e.target.value)}
                      placeholder="ยศพิเศษใน Discord&#10;ไอคอนข้างชื่อบนจอสตรีม"
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-500 text-black font-bold text-xs"
                    >
                      บันทึก
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
