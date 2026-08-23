'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Flame,
  Tv,
  Users,
  ExternalLink,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function DiscoveryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const streamers = [
    {
      username: 'streamerza',
      displayName: 'StreamerZa TH',
      bio: '🎮 สตรีมเกมเมอร์ ROV / Valorant ทุกวัน 19:00 เป็นต้นไป ยินดีต้อนรับทุกคนครับ!',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=streamerza',
      category: 'Gaming',
      followers: '14.2K',
      totalDonations: '48,500 ฿',
      isLive: true,
      tags: ['Valorant', 'ROV', 'Chill'],
    },
    {
      username: 'panin_todd',
      displayName: 'PAnin_ToDD',
      bio: '🐱 สตรีมคุยเล่น ร้องเพลง และเล่นเกมเนื้อเรื่อง ชุมชนคนรักแมวเหมียว',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=panin',
      category: 'Music & Talk',
      followers: '8.9K',
      totalDonations: '25,200 ฿',
      isLive: true,
      tags: ['Music', 'JustChatting'],
    },
    {
      username: 'micky_pro',
      displayName: 'Micky Speedrunner',
      bio: '⚡ สปีดรันเกมคลาสสิก Mario, Dark Souls, Elden Ring ระดับพระกาฬ',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=micky',
      category: 'Gaming',
      followers: '21.5K',
      totalDonations: '94,000 ฿',
      isLive: false,
      tags: ['EldenRing', 'Speedrun'],
    },
    {
      username: 'art_studio',
      displayName: 'Art & Motion TH',
      bio: '🎨 วาดรูป Live 2D, ทำแอนิเมชัน และสอนเทคนิค Digital Art สดๆ',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=art',
      category: 'Art & Creative',
      followers: '6.4K',
      totalDonations: '18,300 ฿',
      isLive: false,
      tags: ['Art', 'Illustration'],
    },
  ];

  const filteredStreamers = streamers.filter((s) => {
    const matchesSearch =
      !search.trim() ||
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = category === 'ALL' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0f131a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold shadow-lg shadow-brand-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Tip<span className="text-brand-400">Dee</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
            >
              แดชบอร์ดสตรีมเมอร์
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-r from-brand-950/40 via-indigo-950/30 to-[#0e1219] shadow-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Globe className="h-4 w-4" />
            <span>Discovery • ทำเนียบสตรีมเมอร์ TipDee</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">
            ค้นพบและร่วมสนับสนุน <span className="text-brand-400">สตรีมเมอร์คนโปรด</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            รวมช่องสตรีมเมอร์และครีเอเตอร์ชั้นนำที่เปิดรับเงินโดเนทผ่าน PromptPay และ TrueMoney
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสตรีมเมอร์, เกม, แท็ก..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-xl"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'Gaming', 'Music & Talk', 'Art & Creative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'ทั้งหมด (All Categories)' : cat}
            </button>
          ))}
        </div>

        {/* Streamers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStreamers.map((s) => (
            <div
              key={s.username}
              className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl hover:border-brand-500/30 hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={s.avatar}
                      alt={s.displayName}
                      className="h-14 w-14 rounded-2xl bg-slate-800 border border-white/10 p-1 object-cover"
                    />
                    {s.isLive && (
                      <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-md">
                        LIVE
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold">
                    {s.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                    {s.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">@{s.username}</p>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">{s.bio}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span>ยอดสะสม </span>
                  <span className="text-brand-400 font-bold">{s.totalDonations}</span>
                </div>

                <Link
                  href={`/u/${s.username}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
                >
                  <span>โดเนท</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
