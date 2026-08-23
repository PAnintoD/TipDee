'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Megaphone,
  Tv,
  Plus,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Clock,
  Trash2,
} from 'lucide-react';

export default function AdsPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [ads, setAds] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSlot, setNewSlot] = useState('ล่างขวา (Bottom Right)');

  const [copiedUrl, setCopiedUrl] = useState(false);
  const adsWidgetUrl = typeof window !== 'undefined' ? `${window.location.origin}/widget/ads/${username}` : `/widget/ads/${username}`;

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) return;

    setAds([
      ...ads,
      {
        id: String(Date.now()),
        title: newTitle.trim(),
        sponsorName: newSponsor.trim() || 'ผู้สนับสนุน',
        imageUrl: newImageUrl.trim(),
        slot: newSlot,
        intervalSeconds: 60,
        active: true,
      },
    ]);

    setNewTitle('');
    setNewSponsor('');
    setNewImageUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Megaphone className="h-6 w-6 text-brand-400" />
                <span>ลงโฆษณา & แบนเนอร์สปอนเซอร์ (Stream Ads & Sponsors)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                จัดการแบนเนอร์สปอนเซอร์ โลโก้ผู้สนับสนุน และโฆษณาขึ้นหมุนเวียนบนจอสตรีม OBS
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มสปอนเซอร์ใหม่</span>
            </button>
          </div>

          {/* OBS Widget URL Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">OBS Browser Source URL สำหรับแสดงโฆษณา</h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                value={adsWidgetUrl}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-slate-300"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(adsWidgetUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold whitespace-nowrap transition-all shadow-md"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
          </div>

          {/* Active Sponsors Grid */}
          {ads.length === 0 ? (
            <div className="p-12 rounded-3xl border border-white/10 bg-[#0e1219]/90 text-center space-y-3">
              <Megaphone className="h-12 w-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">ยังไม่มีแบนเนอร์สปอนเซอร์</h3>
              <p className="text-xs text-slate-400">
                คุณสามารถเพิ่มภาพโลโก้หรือแบนเนอร์สปอนเซอร์เพื่อนำไปแสดงบน OBS ได้
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs transition-all shadow-md"
                >
                  + เพิ่มแบนเนอร์แรก
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-40 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white font-semibold text-[10px]">
                        {item.slot}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-brand-400 font-semibold">{item.sponsorName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>แสดงทุกๆ {item.intervalSeconds} วินาที</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setAds(ads.map((x) => (x.id === item.id ? { ...x, active: !x.active } : x)));
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold"
                    >
                      {item.active ? (
                        <>
                          <ToggleRight className="h-6 w-6 text-brand-400" />
                          <span className="text-emerald-400">กำลังแสดง</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-6 w-6 text-slate-600" />
                          <span className="text-slate-500">ปิดการแสดง</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setAds(ads.filter((x) => x.id !== item.id))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="ลบแบนเนอร์นี้"
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
                <h3 className="text-lg font-bold text-white">เพิ่มแบนเนอร์สปอนเซอร์</h3>
                <form onSubmit={handleAddAd} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ชื่อแคมเปญ / โฆษณา</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="เช่น HyperX Gaming Gear"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ชื่อผู้สนับสนุน (Sponsor Name)</label>
                    <input
                      type="text"
                      value={newSponsor}
                      onChange={(e) => setNewSponsor(e.target.value)}
                      placeholder="เช่น HyperX Thailand"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ลิงก์รูปภาพแบนเนอร์ (Image URL)</label>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.png"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">ตำแหน่งบนจอ OBS</label>
                    <select
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    >
                      <option value="ล่างขวา (Bottom Right)">ล่างขวา (Bottom Right)</option>
                      <option value="มุมบนซ้าย (Top Left)">มุมบนซ้าย (Top Left)</option>
                      <option value="มุมบนขวา (Top Right)">มุมบนขวา (Top Right)</option>
                    </select>
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
