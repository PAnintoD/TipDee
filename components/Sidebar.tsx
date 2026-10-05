'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  User,
  Package,
  History,
  Globe,
  Headphones,
  Wallet,
  Tv,
  Bell,
  Music,
  Smile,
  Code2,
  Receipt,
  Gift,
  Star,
  DollarSign,
  Megaphone,
  FileSpreadsheet,
  Store,
  LogOut,
  Sparkles,
  Building2,
  QrCode,
} from 'lucide-react';

interface SidebarProps {
  streamerId?: string;
}

export function Sidebar({ streamerId }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const username = streamerId || user?.username || 'streamerza';

  const [mode, setMode] = useState<'streamer' | 'member'>('streamer');

  const generalItems = [
    { name: 'หน้าจัดการ', href: '/dashboard', icon: Home },
    { name: 'บัญชีผู้ใช้', href: '/dashboard/account', icon: User },
    { name: 'แพลนและการใช้งาน', href: '/dashboard/plans', icon: Package },
    { name: 'ประวัติการสมัครแพลน', href: '/dashboard/plans/history', icon: History },
    { name: 'Discovery', href: '/discovery', icon: Globe },
    { name: 'ระบบสมาชิก', href: '/dashboard/memberships', icon: Headphones },
  ];

  const paymentItems = [
    { name: 'บัญชีรับเงิน', href: '/dashboard/payment', icon: Wallet },
    { name: 'หน้ารับเงิน', href: '/dashboard/profile', icon: Tv },
    { name: 'วิดเจ็ต', href: '/dashboard/widgets', icon: Bell },
    { name: 'สร้าง QR Code', href: '/dashboard/qrcode', icon: QrCode },
    { name: 'คลังเสียง', href: '/dashboard/sounds', icon: Music },
    { name: 'คลังสติกเกอร์', href: '/dashboard/stickers', icon: Smile },
    { name: 'โซนผู้พัฒนา', href: '/dashboard/developer', icon: Code2 },
    { name: 'ประวัติการรับเงิน', href: '/dashboard/donations', icon: Receipt },
    { name: 'ประวัติการรับแพลน', href: '/dashboard/plans/history', icon: Gift },
    { name: 'อันดับผู้โดเนท', href: '/dashboard/leaderboard', icon: Star },
    { name: 'ผู้ช่วยภาษี', href: '/dashboard/tax', icon: DollarSign },
    { name: 'ลงโฆษณา', href: '/dashboard/ads', icon: Megaphone },
  ];

  const agencyItems = [
    { name: 'ขอเปิดสังกัด', href: '/dashboard/agency', icon: Building2 },
  ];

  const marketItems = [
    { name: 'ตลาด', href: '/marketplace', icon: Store },
  ];

  const renderNavGroup = (title: string, items: Array<{ name: string; href: string; icon: any }>) => (
    <div className="space-y-1">
      <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-60 flex-shrink-0 hidden lg:block border-r border-slate-200/80 bg-white p-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        {/* Top Mode Switcher (สตรีมเมอร์ | สมาชิก) */}
        <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center gap-1">
          <button
            onClick={() => setMode('streamer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'streamer'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            <span>สตรีมเมอร์</span>
          </button>

          <button
            onClick={() => setMode('member')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'member'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>สมาชิก</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {renderNavGroup('ทั่วไป', generalItems)}
          <div className="h-px bg-slate-100 mx-2" />
          {renderNavGroup('การรับเงิน & วิดเจ็ต', paymentItems)}
          <div className="h-px bg-slate-100 mx-2" />
          {renderNavGroup('สังกัด & ตลาด', [...agencyItems, ...marketItems])}
          <div className="h-px bg-slate-100 mx-2" />

          {/* Sign Out */}
          <div className="pt-1">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
