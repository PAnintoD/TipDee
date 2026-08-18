import React from 'react';
import Link from 'next/link';
import {
  Flame,
  QrCode,
  Volume2,
  Tv,
  Gift,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  ExternalLink,
  Target,
  Trophy,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: QrCode,
      title: 'PromptPay Dynamic QR',
      description: 'สร้าง QR Code พร้อมเพย์ตามมาตรฐาน EMVCo ระบุจำนวนเงินอัตโนมัติ สแกนจ่ายได้ทุกแอปธนาคารไทย',
      color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
    },
    {
      icon: Volume2,
      title: 'OBS Alert Box & Thai TTS',
      description: 'กล่องแจ้งเตือนขึ้นจอ OBS Studio แบบ Realtime พร้อมระบบอ่านออกเสียงสังเคราะห์ภาษาไทยอัตโนมัติ',
      color: 'from-brand-600/20 to-brand-900/10 border-brand-500/30 text-brand-400',
    },
    {
      icon: Gift,
      title: 'TrueMoney Voucher',
      description: 'รองรับการโดเนทผ่านลิงก์ซองของขวัญทรูมันนี่ สะดวก รวดเร็ว ไม่เสียค่าธรรมเนียมแพลตฟอร์ม',
      color: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400',
    },
    {
      icon: Target,
      title: 'Donation Goal Bar',
      description: 'แถบเป้าหมายการระดมทุน (เช่น ซื้อไมค์ใหม่, อัปเกรดคอม) อัปเดต % ความคืบหน้าแบบเรียลไทม์',
      color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30 text-purple-400',
    },
    {
      icon: Trophy,
      title: 'Top Donors Leaderboard',
      description: 'บอร์ดจัดอันดับผู้สนับสนุนสูงสุดประจำวัน สัปดาห์ เดือน และตลอดกาล พร้อมเหรียญรางวัล',
      color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: TrendingUp,
      title: 'Donation Analytics & CSV',
      description: 'ระบบรายงานสถิติรายได้ ค้นหาประวัติโดเนท เล่นแจ้งเตือนซ้ำบน OBS และส่งออกไฟล์ CSV',
      color: 'from-pink-600/20 to-pink-900/10 border-pink-500/30 text-pink-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0f131a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold shadow-lg shadow-brand-500/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Easy<span className="text-brand-400">Donate</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">V2</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/u/streamerza"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-white/10 transition-all"
            >
              <span>หน้าโดเนทตัวอย่าง</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>เข้าสู่ระบบ Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glow backdrop circles */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute right-10 top-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ระบบรับเงินโดเนทสตรีมเมอร์อันดับ 1 ในไทย</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            รับโดเนทแจ้งเตือนขึ้นจอ{' '}
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              OBS Studio & TikTok
            </span>{' '}
            พร้อมเสียงอ่านภาษาไทย
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            รองรับ <strong>PromptPay Dynamic QR Code</strong> ระบุยอดเป๊ะๆ สแกนจ่ายง่าย, <strong>ซองของขวัญ TrueMoney</strong>,
            และวิดเจ็ตปรับแต่งได้อิสระ 100% เชื่อมต่อง่าย ไม่หักเปอร์เซ็นต์ส่วนแบ่ง
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>เปิดแดชบอร์ดสตรีมเมอร์</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/u/streamerza"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-white/10 transition-all hover:border-white/20"
            >
              <span>ทดลองหน้าโดเนทผู้บริจาค</span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ฟังก์ชันครบครัน ถอดแบบระบบสตรีมเมอร์ชั้นนำ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ระบบทำงานแบบ Realtime ทันทีที่มีการโอนเงิน เสียงและแอนิเมชันจะเด้งขึ้น OBS ทันที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`p-6 rounded-3xl border bg-gradient-to-br ${f.color} backdrop-blur-md space-y-3 transition-all hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* OBS Setup Quick Guide */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">วิธีนำ Widget ไปใส่ใน OBS Studio ง่ายๆ 3 ขั้นตอน</h3>
              <p className="text-xs text-slate-400">รองรับทั้ง OBS Studio, Streamlabs Desktop, และ TikTok Live Studio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2">
              <div className="text-brand-400 font-extrabold text-lg">01</div>
              <h4 className="text-sm font-bold text-white">คัดลอกลิงก์ Widget</h4>
              <p className="text-xs text-slate-400">
                เข้าหน้า Dashboard &rarr; วิดเจ็ตสตรีม แล้วกดคัดลอก URL ของ Alert Box หรือ Goal
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2">
              <div className="text-brand-400 font-extrabold text-lg">02</div>
              <h4 className="text-sm font-bold text-white">เพิ่ม Browser Source</h4>
              <p className="text-xs text-slate-400">
                ในโปรแกรม OBS กดปุ่ม <strong>+</strong> ในช่อง Sources เลือก <strong>Browser</strong> แล้ววาง URL ลงไป
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2">
              <div className="text-brand-400 font-extrabold text-lg">03</div>
              <h4 className="text-sm font-bold text-white">ทดสอบแจ้งเตือน</h4>
              <p className="text-xs text-slate-400">
                กดปุ่ม <strong>"ทดสอบแจ้งเตือน"</strong> ใน Dashboard เพื่อดูภาพ ป๊อปอัป และฟังเสียง TTS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>EasyDonate System &copy; 2026 - ระบบบริจาคสำหรับสตรีมเมอร์และคอนเทนต์ครีเอเตอร์</p>
      </footer>
    </div>
  );
}
