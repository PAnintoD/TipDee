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
      <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
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
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-60 flex-shrink-0 hidden lg:block border-r border-white/5 bg-[#0b0e14] p-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-5">
        {/* Top Mode Switcher (สตรีมเมอร์ | สมาชิก) */}
        <div className="p-1 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-1">
          <button
            onClick={() => setMode('streamer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'streamer'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            <span>สตรีมเมอร์</span>
          </button>

          <button
            onClick={() => setMode('member')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'member'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>สมาชิก</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {renderNavGroup('ทั่วไป', generalItems)}
          <div className="h-px bg-white/5 mx-2" />
          {renderNavGroup('การรับเงิน', paymentItems)}
          <div className="h-px bg-white/5 mx-2" />
          {renderNavGroup('สังกัด', agencyItems)}
          <div className="h-px bg-white/5 mx-2" />
          {renderNavGroup('ตลาด', marketItems)}
          <div className="h-px bg-white/5 mx-2" />

          {/* Sign Out */}
          <div className="pt-1">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
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
