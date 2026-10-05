'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Users,
  Crown,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function MembershipsPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState(50);
  const [newTierPerk, setNewTierPerk] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const totalMRR = tiers.reduce((sum, t) => sum + (t.price || 0) * (t.membersCount || 0), 0);
  const totalMembers = tiers.reduce((sum, t) => sum + (t.membersCount || 0), 0);

  useEffect(() => {
    fetch(`/api/streamer?id=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.membershipsSettings)) {
          setTiers(data.data.membershipsSettings);
        }
      })
      .catch((e) => console.error('Failed to load memberships', e))
      .finally(() => setLoading(false));
  }, [username]);

  const saveTiersToDb = async (updatedTiers: any[]) => {
    try {
      await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: username,
          membershipsSettings: updatedTiers,
        }),
      });
      setSavedSuccessMsg('บันทึกระดับสมาชิกเรียบร้อยแล้ว');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to save tiers', e);
    }
  };

  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) return;

    const newTier = {
      id: String(Date.now()),
      name: newTierName.trim(),
      price: Number(newTierPrice),
      badge: '⭐',
      membersCount: 0,
      perks: newTierPerk ? newTierPerk.split('\n').filter((x) => x.trim()) : ['สิทธิ์สมาชิกพิเศษในช่อง'],
    };

    const updated = [...tiers, newTier];
    setTiers(updated);
    await saveTiersToDb(updated);

    setNewTierName('');
    setNewTierPerk('');
    setShowAddModal(false);
  };

  const handleDeleteTier = async (id: string) => {
    const updated = tiers.filter((x) => x.id !== id);
    setTiers(updated);
    await saveTiersToDb(updated);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Users className="h-6 w-6 text-emerald-600" />
                <span>ระบบสมาชิกรายเดือน (Fan Memberships)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                สร้างระดับสมาชิกให้แฟนคลับสมัครรับสิทธิพิเศษและสนับสนุนช่องคุณอย่างต่อเนื่องทุกเดือน
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างระดับสมาชิกใหม่</span>
            </button>
          </div>

          {savedSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* MRR Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-medium">รายได้รายเดือนสะสม (MRR)</span>
              <p className="text-2xl font-black text-slate-900">
                {totalMRR.toLocaleString('th-TH')} <span className="text-sm font-bold text-emerald-600">฿ / เดือน</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">คำนวณจากสมาชิกที่ Active</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-medium">จำนวนสมาชิกทั้งหมด</span>
              <p className="text-2xl font-black text-slate-900">
                {totalMembers} <span className="text-sm font-bold text-slate-400">คน</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium">แฟนคลับที่สนับสนุนรายเดือน</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-medium">ระดับสมาชิกที่เปิดรับ</span>
              <p className="text-2xl font-black text-slate-900">
                {tiers.length} <span className="text-sm font-bold text-slate-400">ระดับ</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Tier สมาชิกของช่องคุณ</p>
            </div>
          </div>

          {/* Tiers List */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-200/80 bg-white text-center space-y-3 shadow-sm">
              <Crown className="h-12 w-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">ยังไม่มีระดับสมาชิกของช่อง</h3>
              <p className="text-xs text-slate-500">
                คุณสามารถสร้างระดับสมาชิก Tier 1, 2, 3 เพื่อให้ผู้ชมสมัครสนับสนุนรายเดือนได้
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
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
                  className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between space-y-4 relative group hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{t.badge}</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        {t.membersCount} สมาชิก
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        {t.price} <span className="text-xs text-slate-500 font-semibold">บาท / เดือน</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500">สิทธิพิเศษ:</p>
                      {t.perks.map((p: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(t.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shadow-2xs"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-900">สร้างระดับสมาชิกใหม่</h3>
                <form onSubmit={handleAddTier} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อระดับ (Tier Name)</label>
                    <input
                      type="text"
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      placeholder="เช่น แฟนคลับตัวยง Tier 1"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ราคาต่อเดือน (บาท)</label>
                    <input
                      type="number"
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(Number(e.target.value))}
                      min={10}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">สิทธิพิเศษ (บรรทัดละ 1 ข้อ)</label>
                    <textarea
                      value={newTierPerk}
                      onChange={(e) => setNewTierPerk(e.target.value)}
                      placeholder="ยศพิเศษใน Discord&#10;ไอคอนข้างชื่อบนจอสตรีม"
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
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
