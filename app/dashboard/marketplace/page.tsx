'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Store,
  Sparkles,
  ShoppingBag,
  Star,
  Check,
  Search,
  ExternalLink,
  Download,
} from 'lucide-react';

export default function MarketplacePage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const items = [
    {
      id: '1',
      title: 'Neon Cyberpunk OBS Overlay Pack',
      author: 'TipDee Studio',
      category: 'Overlays',
      price: 'ฟรี',
      rating: 4.9,
      downloads: '1.4K',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      desc: 'ธีมโอเวอร์เลย์สไตล์นีออนไซเบอร์พังก์ พร้อมแอนิเมชัน Glitch แจ้งเตือนสุดเท่',
    },
    {
      id: '2',
      title: 'Retro Pixel Art 8-Bit Goal Bar',
      author: 'PixelMaster',
      category: 'Goal Bars',
      price: 'ฟรี',
      rating: 4.8,
      downloads: '980',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      desc: 'แถบเป้าหมายการระดมทุนสไตล์เกมพิกเซลเรโทร พร้อมตัวละครเดินเมื่อยอดเพิ่ม',
    },
    {
      id: '3',
      title: 'Anime Vtuber Chibi Alert Voice Pack',
      author: 'Sakura Voice',
      category: 'Soundpacks',
      price: 'ฟรี',
      rating: 5.0,
      downloads: '2.1K',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      desc: 'ชุดเสียงพากย์น่ารักสไตล์อนิเมะสำหรับแจ้งเตือนยอดโดเนทและแฟนคลับ',
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch = !search.trim() || item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Store className="h-6 w-6 text-brand-400" />
                <span>ตลาดวิดเจ็ต & ธีมสตรีม (Marketplace)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ดาวน์โหลดธีม OBS, แถบ Goal Bar, ชุดเสียงแจ้งเตือน และสกินปรับแต่งสำหรับช่องของคุณ
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'Overlays', 'Goal Bars', 'Soundpacks'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'ทั้งหมด (All)' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาธีม, วิดเจ็ต..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-xl flex flex-col justify-between space-y-4 group hover:border-brand-500/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="h-44 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-brand-400 font-bold text-xs">
                      {item.price}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.author}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 group-hover:text-brand-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">ดาวน์โหลดแล้ว {item.downloads} ครั้ง</span>
                  <button
                    onClick={() => alert(`ติดตั้ง "${item.title}" ลงในคลังวิดเจ็ตของคุณสำเร็จ!`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-md transition-all hover:scale-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>ติดตั้งใช้งาน</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
