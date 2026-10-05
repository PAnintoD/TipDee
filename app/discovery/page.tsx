'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  ExternalLink,
  Loader2,
  Users,
  Compass,
} from 'lucide-react';

export default function DiscoveryPage() {
  const [search, setSearch] = useState('');
  const [streamers, setStreamers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discovery?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setStreamers(res.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-black text-white text-xs tracking-tight shadow-sm transition-transform group-hover:scale-95">
              TD
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Tip<span className="text-emerald-600">Dee</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full ml-1 hidden sm:inline-block">
              Discovery
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              แดชบอร์ดสตรีมเมอร์
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-slate-200/80 bg-white shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
              <Compass className="h-3.5 w-3.5" />
              <span>ทำเนียบสตรีมเมอร์ TipDee</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              ค้นพบและร่วมสนับสนุนครีเอเตอร์
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              รายชื่อสตรีมเมอร์และคอนเทนต์ครีเอเตอร์ที่ใช้งานระบบ TipDee คุณสามารถร่วมส่งกำลังใจและข้อความขึ้นจอสตรีมได้โดยตรง
            </p>

            {/* Search bar */}
            <div className="relative mt-5 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสตรีมเมอร์ หรือ @username..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-2xs transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Streamers Grid */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">กำลังโหลดรายชื่อสตรีมเมอร์...</span>
          </div>
        ) : streamers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 p-12 text-center rounded-2xl shadow-sm">
            <Users className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800">ไม่พบสตรีมเมอร์ที่ตรงกับคำค้นหา</p>
            <p className="text-xs text-slate-500 mt-1">ลองใช้คำค้นหาอื่น หรือตรวจดูตัวสะกดอีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {streamers.map((s) => (
              <div
                key={s.username}
                className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.displayName}
                      className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                        {s.displayName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">@{s.username}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {s.bio || 'ไม่มีคำแนะนำตัว'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span className="text-slate-400">ยอดสะสม: </span>
                    <span className="text-slate-900 font-mono font-semibold">{s.totalDonations}</span>
                  </div>

                  <Link
                    href={`/u/${s.username}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>โดเนท</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
