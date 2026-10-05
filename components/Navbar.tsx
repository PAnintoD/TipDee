'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Flame,
  Radio,
  ExternalLink,
  Bell,
  Sparkles,
  Check,
  Copy,
  Menu,
  X,
  LayoutDashboard,
  ReceiptText,
  Tv2,
  Wallet,
  UserCircle,
  TrendingUp,
} from 'lucide-react';
import { TestAlertModal } from './TestAlertModal';

interface NavbarProps {
  streamerId?: string;
}

export function Navbar({ streamerId }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const activeStreamerId = streamerId || (session?.user as any)?.username || 'streamerza';

  const [showTestModal, setShowTestModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicDonateUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${activeStreamerId}` : `/u/${activeStreamerId}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(publicDonateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { name: 'ภาพรวม (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'รายการโดเนท (Donations)', href: '/dashboard/donations', icon: ReceiptText },
    { name: 'สถิติรายได้ (Analytics)', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'วิดเจ็ตสตรีม (Widgets)', href: '/dashboard/widgets', icon: Tv2 },
    { name: 'บัญชีรับเงิน (Payments)', href: '/dashboard/payment', icon: Wallet },
    { name: 'หน้าโดเนทของฉัน (Profile)', href: '/dashboard/profile', icon: UserCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-xs transition-transform group-hover:scale-[1.02]">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Tip<span className="text-emerald-600">Dee</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Studio</span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">ระบบโดเนทสตรีมเมอร์ & ครีเอเตอร์</p>
              </div>
            </Link>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>ระบบ Online</span>
            </div>

            {/* Test Alert Button */}
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200/80 transition-colors"
              title="ส่งการแจ้งเตือนจำลองไปยัง OBS"
            >
              <Bell className="h-4 w-4 text-emerald-600" />
              <span>ทดสอบแจ้งเตือน</span>
            </button>

            {/* Copy Public Donation Page Link */}
            <button
              onClick={handleCopyLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200/80 transition-colors"
              title="คัดลอกลิงก์หน้าโดเนทสำหรับส่งให้ผู้ชม"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'ลิงก์โดเนท'}</span>
            </button>

            {/* Open Public Donation Page */}
            <Link
              href={`/u/${activeStreamerId}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>หน้าโดเนท</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-2 shadow-lg animate-slide-up">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Test Alert Modal */}
      {showTestModal && (
        <TestAlertModal streamerId={activeStreamerId} onClose={() => setShowTestModal(false)} />
      )}
    </>
  );
}
