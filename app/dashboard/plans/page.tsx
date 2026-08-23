'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Package,
  Check,
  Zap,
  Crown,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
} from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [currentPlan, setCurrentPlan] = useState<'FREE' | 'PRO' | 'VIP'>('PRO');

  const plans = [
    {
      id: 'FREE',
      name: 'Starter (ฟรีตลอดชีพ)',
      price: '0',
      period: 'ตลอดชีพ',
      desc: 'เหมาะสำหรับผู้เริ่มต้นสตรีมและรับเงินโดเนทพื้นฐาน',
      badge: 'เริ่มต้น',
      features: [
        'รับเงินผ่าน PromptPay Dynamic QR',
        'กล่องแจ้งเตือน Alert Box บน OBS',
        'เสียงอ่านข้อความภาษาไทย TTS พื้นฐาน',
        'ประวัติรายการโดเนทย้อนหลัง 30 วัน',
        'ค่าธรรมเนียมแพลตฟอร์ม 0%',
      ],
      popular: false,
    },
    {
      id: 'PRO',
      name: 'Streamer Pro (ยอดนิยม)',
      price: '99',
      period: 'บาท / เดือน',
      desc: 'ปลดล็อกทุกฟังก์ชันระดับพรีเมียมสำหรับสตรีมเมอร์มืออาชีพ',
      badge: 'แนะนำสูงสุด ⭐',
      features: [
        'ทุกฟีเจอร์ในแพลน Starter',
        'ระบบสแกนสลิปออโต้ (Auto Slip Verification)',
        'เสียง TTS พิเศษ ปรับ Pitch/Speed และกรองคำหยาบ',
        'วิดเจ็ตครบชุด (Goal Bar, Top Donors, Recent Donors)',
        'ส่งแจ้งเตือนเข้า Discord Webhook อัตโนมัติ',
        'ดาวน์โหลดรายงานการเงิน CSV ไม่จำกัด',
        'ไม่มีลายน้ำ TipDee บนหน้าโดเนท',
      ],
      popular: true,
    },
    {
      id: 'VIP',
      name: 'Creator VIP & Studio',
      price: '299',
      period: 'บาท / เดือน',
      desc: 'สำหรับสังกัด ครีเอเตอร์ชั้นนำ และทีมงานสตรีมมิ่ง',
      badge: 'ฟังก์ชันเต็มพิกัด 👑',
      features: [
        'ทุกฟีเจอร์ในแพลน Pro',
        'ระบบสมาชิกรายเดือนสำหรับแฟนคลับ (Memberships)',
        'ระบบจัดการสังกัดสตรีมเมอร์ (Multi-Channel Agency)',
        'Custom Domain บนหน้าโดเนทของคุณเอง',
        'Developer API เข้าถึง Realtime Event Stream ตรง',
        'ผู้ช่วยคำนวณภาษีเงินได้สตรีมเมอร์ (ภ.ง.ด. 90/91)',
        'ทีมงาน Support ดูแลผ่าน LINE พิเศษ 24/7',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Package className="h-6 w-6 text-brand-400" />
                <span>แพลนและการใช้งาน (Plans & Subscriptions)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                เลือกแพลนที่เหมาะกับช่องของคุณ ปลดล็อกฟีเจอร์สตรีมมิ่งระดับพรีเมียม
              </p>
            </div>

            <Link
              href="/dashboard/plans/history"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105"
            >
              <History className="h-4 w-4 text-brand-400" />
              <span>ประวัติการสมัครแพลน</span>
            </Link>
          </div>

          {/* Current Plan Status Card */}
          <div className="p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900/80 to-[#0e1219] shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Crown className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">แพลนปัจจุบันของคุณ:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-extrabold text-xs border border-brand-500/30">
                    STREAMER PRO
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-0.5">ใช้งานได้ต่อเนื่องทุกฟังก์ชัน</h2>
                <p className="text-xs text-slate-400">รอบบิลถัดไป: 23 กันยายน 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('แพลนของคุณได้รับการต่ออายุอัตโนมัติแล้ว')}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-black text-xs transition-all shadow-lg shadow-brand-500/20"
              >
                จัดการการต่ออายุ
              </button>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {plans.map((p) => {
              const isCurrent = currentPlan === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-7 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
                    p.popular
                      ? 'bg-gradient-to-b from-[#121926] to-[#0d1117] border-brand-500/50 shadow-2xl shadow-brand-500/10 scale-[1.02]'
                      : 'bg-[#0e1219]/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-black text-[11px] shadow-lg">
                      {p.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2 border-t border-white/5">
                      <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                      <span className="text-xs text-slate-400 font-semibold">{p.period}</span>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      {p.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setCurrentPlan(p.id as any);
                        alert(`สลับไปยังแพลน ${p.name} สำเร็จ!`);
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-slate-800 text-brand-400 border border-brand-500/30 cursor-default'
                          : p.popular
                          ? 'bg-brand-500 hover:bg-brand-400 text-black shadow-lg shadow-brand-500/25 font-black hover:scale-105'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:scale-105'
                      }`}
                    >
                      {isCurrent ? '✓ แพลนปัจจุบันของคุณ' : `เลือกแพลน ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
