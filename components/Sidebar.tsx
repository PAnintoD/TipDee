'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ReceiptText,
  Sliders,
  Wallet,
  UserCircle,
  Tv2,
  Volume2,
  Sparkles,
  HelpCircle,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  streamerId?: string;
}

export function Sidebar({ streamerId }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const username = streamerId || user?.username || 'streamerza';
  const displayName = user?.name || user?.username || 'สตรีมเมอร์';
  const initials = (displayName || 'SZ').slice(0, 2).toUpperCase();

  const navItems = [
    {
      name: 'ภาพรวม (Dashboard)',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Realtime',
    },
    {
      name: 'รายการโดเนท (Donations)',
      href: '/dashboard/donations',
      icon: ReceiptText,
    },
    {
      name: 'วิดเจ็ตสตรีม (Widgets)',
      href: '/dashboard/widgets',
      icon: Tv2,
      highlight: true,
    },
    {
      name: 'บัญชีรับเงิน (Payments)',
      href: '/dashboard/payment',
      icon: Wallet,
    },
    {
      name: 'หน้าโดเนทของฉัน (Profile)',
      href: '/dashboard/profile',
      icon: UserCircle,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block border-r border-white/5 bg-[#0b0e14] p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md overflow-hidden flex-shrink-0">
              <span className="text-sm">{initials}</span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{displayName}</h4>
              <p className="text-xs text-brand-400 font-medium truncate">@{username}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            เมนูหลัก (Main Menu)
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/20 to-brand-500/10 text-brand-400 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* OBS Quick Box */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-slate-900/80 to-brand-950/30 border border-brand-500/20 space-y-2">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>พร้อมใช้งานบน OBS</span>
          </div>
          <p className="text-[12px] text-slate-300 leading-relaxed">
            เพิ่ม Browser Source ใน OBS Studio ด้วยลิงก์ Alert Box เพื่อให้การแจ้งเตือนขึ้นจอทันที
          </p>
          <Link
            href="/dashboard/widgets"
            className="block text-center text-xs font-semibold text-brand-400 hover:text-brand-300 pt-1"
          >
            ตั้งค่า OBS Widget &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
