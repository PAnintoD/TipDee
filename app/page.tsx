'use client';

import React, { useState } from 'react';
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
  ExternalLink,
  Target,
  Trophy,
  Check,
  Copy,
  Receipt,
  Play,
  Layers,
  BarChart3,
  Sliders,
} from 'lucide-react';

export default function LandingPage() {
  // Interactive preview state for the hero OBS simulation
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const previewPresets = [
    {
      donorName: 'น้องมินนี่',
      amount: 50,
      message: 'เป็นกำลังใจให้พี่สตรีมเมอร์นะค้าบ เล่นเกมเก่งมาก!',
      time: '1 นาทีที่แล้ว',
      badge: 'แฟนคลับ',
    },
    {
      donorName: 'GamerZa99',
      amount: 200,
      message: 'ขอเพลงประกอบสตรีมมันส์ๆ หน่อยครับ สู้ต่อไป!',
      time: 'เมื่อสักครู่',
      badge: 'VIP',
    },
    {
      donorName: 'เสี่ยบอยสายเปย์',
      amount: 1000,
      message: 'จัดไปค่ากาแฟ สนับสนุนอุปกรณ์คอมใหม่ครับผม!',
      time: 'เมื่อสักครู่',
      badge: 'TOP DONOR',
    },
  ];

  const currentPreview = previewPresets[selectedPresetIndex];

  const handleCopySampleUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/widget/alert/streamerza`);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Tip<span className="text-emerald-600">Dee</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Studio
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/u/streamerza"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors"
            >
              <span>หน้าโดเนทตัวอย่าง</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            </Link>

            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>สมัครใช้งานฟรี</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Value Proposition & Live Overlay Simulator */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>PromptPay Dynamic QR • Auto Slip • OBS Overlay</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                ระบบรับโดเนทสตรีมเมอร์
                <span className="block text-emerald-600 mt-1">
                  เงินเข้าบัญชีตรง แจ้งเตือนขึ้นจอทันที
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                เชื่อมต่อ OBS Studio และ TikTok Live ได้ใน 3 นาที รองรับ PromptPay QR ระบุยอดอัตโนมัติ
                ระบบสแกนสลิปป้องกันสลิปซ้ำ และเสียงอ่านสังเคราะห์ภาษาไทย (TTS) โดยไม่มีการหักค่าธรรมเนียมแพลตฟอร์ม
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-xs"
                >
                  <span>เปิดใช้งานฟรีสำหรับสตรีมเมอร์</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/u/streamerza"
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-2xs transition-colors"
                >
                  <span>ทดลองหน้าโดเนทของผู้ชม</span>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </Link>
              </div>

              {/* Trust & Spec Badges */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>เข้าบัญชีตรง 100% ไม่มีหัก %</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Zap className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>แจ้งเตือน Realtime ทันที</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <QrCode className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>สแกนสลิปเช็ค QR ออโต้</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive OBS Overlay Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
                {/* Window title bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-mono text-slate-500 text-[11px] ml-2">
                      OBS Studio • Browser Source Preview
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    LIVE
                  </span>
                </div>

                {/* Simulated Stream Screen (Keep dark so live alert pops like OBS stream screen) */}
                <div className="relative aspect-[16/10] rounded-lg bg-[#07090e] border border-slate-200/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                  {/* Subtle Grid pattern representing stream background */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Top: Donation Goal Bar in OBS */}
                  <div className="relative z-10 w-full rounded-md bg-[#0e1219]/90 border border-white/[0.08] p-2 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">🎯 เป้าหมาย: ซื้อไมค์สตรีมใหม่</span>
                      <span className="text-emerald-400 font-bold tabular-nums">75%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  {/* Center: Live Alert Popup */}
                  <div className="relative z-10 self-center my-auto w-full max-w-sm rounded-lg bg-[#111622] border border-emerald-500/30 p-3.5 text-center space-y-2 shadow-lg animate-alert-pop">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      <span>{currentPreview.donorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {currentPreview.badge}
                      </span>
                    </div>

                    <div className="text-lg font-bold text-white tabular-nums">
                      โดเนท <span className="text-emerald-400">{currentPreview.amount.toLocaleString('th-TH')} บาท</span>
                    </div>

                    <p className="text-xs text-slate-200 bg-black/40 px-2.5 py-1.5 rounded border border-white/[0.06] italic">
                      "{currentPreview.message}"
                    </p>
                  </div>

                  {/* Bottom: Simulated Sound & TTS Indicator */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.04] pt-2">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Volume2 className="h-3 w-3" />
                      <span>TTS อ่านออกเสียงภาษาไทย</span>
                    </div>
                    <span>{currentPreview.time}</span>
                  </div>
                </div>

                {/* Preset switcher to test the overlay simulation */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">จำลองยอดโดเนทที่เข้ามา:</span>
                    <span className="text-[11px] text-slate-400">คลิกเพื่อสลับดูผลลัพธ์</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {previewPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPresetIndex(idx)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                          selectedPresetIndex === idx
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{preset.amount} ฿</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.donorName}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Product Features (Dual Perspectives) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ออกแบบให้ตอบโจทย์ทั้งสตรีมเมอร์และผู้ชม
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            ไม่ใช่แค่ระบบรับเงิน แต่เป็นเครื่องมือช่วยสร้างการมีส่วนร่วม (Engagement) ขณะไลฟ์สตรีมแบบไร้รอยต่อ
          </p>
        </div>

        {/* 2-Column Split: Streamer Side vs Viewer Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: For Streamers */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Tv className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">สำหรับสตรีมเมอร์ & ครีเอเตอร์</h3>
                <p className="text-xs text-slate-500">ควบคุมระบบและแสดงผลขึ้นหน้าจอสด</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">OBS Alert Box พร้อมเสียงและ TTS</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    กล่องแจ้งเตือนพื้นหลังโปร่งใส 100% สังเคราะห์เสียงอ่านภาษาไทยอัตโนมัติ ไม่ต้องพึ่งบอทนอก
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">Donation Goal & Top Donors Leaderboard</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    วิดเจ็ตเป้าหมายระดมทุนอัปเดตแบบเรียลไทม์ และตารางอันดับผู้สนับสนุนประจำวัน สัปดาห์ เดือน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">แดชบอร์ดสถิติ & ส่งออกไฟล์ CSV</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ตรวจสอบยอดเงินสดๆ กดยิงแจ้งเตือนซ้ำบน OBS ได้ตลอดเวลา และดาวน์โหลดรายการไปทำบัญชีง่ายๆ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: For Donors / Viewers */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">สำหรับผู้ชมและผู้สนับสนุน</h3>
                <p className="text-xs text-slate-500">ชำระเงินสะดวก รวดเร็ว และมั่นใจได้</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">PromptPay Dynamic QR มาตรฐาน EMVCo</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    สร้าง QR Code พร้อมเพย์ตามยอดที่ต้องการทันที สแกนจ่ายได้ทุกแอปธนาคารไทย ยอดตรงไม่ผิดพลาด
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">สแกนสลิปอัจฉริยะ (Anti-Duplicate)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    แนบสลิปเพื่อยืนยันการโอนเงิน ระบบจะอ่าน Mini QR Code บนสลิปและป้องกันการใช้ซ้ำอย่างปลอดภัย
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">ซองของขวัญ TrueMoney Voucher</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    รองรับการวางลิงก์ซองของขวัญทรูมันนี่ โดเนทได้ทันทีโดยไม่ต้องผูกบัตรเครดิต
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBS Setup Quick Guide: Clean Step-by-Step with Code Block */}
      <section className="py-16 border-t border-b border-slate-200/80 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              วิธีนำวิดเจ็ตไปใส่ในโปรแกรมสตรีม
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              รองรับทั้ง OBS Studio, Streamlabs Desktop, Prism Live และ TikTok Live Studio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-emerald-600">STEP 01</span>
              <h3 className="text-sm font-semibold text-slate-900">คัดลอกลิงก์วิดเจ็ต</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                เข้า Dashboard ไปที่เมนู <strong>วิดเจ็ต</strong> แล้วกดคัดลอก URL ของ Alert Box หรือ Goal Bar
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-emerald-600">STEP 02</span>
              <h3 className="text-sm font-semibold text-slate-900">เพิ่ม Browser Source ใน OBS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ในหน้าต่าง Sources กดปุ่ม <strong>+</strong> เลือก <strong>Browser</strong> แล้ววาง URL ลงไป (ขนาด 800 x 600)
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-emerald-600">STEP 03</span>
              <h3 className="text-sm font-semibold text-slate-900">กดทดสอบแจ้งเตือน</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                กดปุ่ม <strong>"ทดสอบแจ้งเตือน"</strong> ในแดชบอร์ด เพื่อยืนยันว่าภาพและเสียงออกจอไลฟ์อย่างถูกต้อง
              </p>
            </div>
          </div>

          {/* Quick URL Copy Bar */}
          <div className="p-4 rounded-lg bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Tv className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-700 font-medium flex-shrink-0">URL ตัวอย่าง:</span>
              <code className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate">
                http://localhost:3000/widget/alert/streamerza
              </code>
            </div>
            <button
              onClick={handleCopySampleUrl}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-colors flex-shrink-0"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอก URL'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          เริ่มต้นรับโดเนทสำหรับช่องของคุณวันนี้
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          สมัครใช้งานได้ทันทีฟรี ไม่ต้องใช้เอกสารยุ่งยาก เชื่อมต่อพร้อมเพย์และเปิดสตรีมได้ภายในไม่กี่นาที
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-xs"
          >
            สร้างบัญชีสตรีมเมอร์ฟรี
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-2xs transition-colors"
          >
            เข้าสู่แดชบอร์ด
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TipDee</span>
            <span>— แพลตฟอร์มระบบโดเนทสตรีมเมอร์ & ครีเอเตอร์</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/u/streamerza" className="hover:text-slate-900 transition-colors">
              หน้าโดเนทตัวอย่าง
            </Link>
            <Link href="/discovery" className="hover:text-slate-900 transition-colors">
              ทำเนียบสตรีมเมอร์
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
