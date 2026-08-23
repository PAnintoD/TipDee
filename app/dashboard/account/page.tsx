'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  Save,
} from 'lucide-react';

export default function UserAccountPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const username = user?.username || 'streamerza';

  const [displayName, setDisplayName] = useState(user?.name || 'สตรีมเมอร์');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPassword !== confirmPassword) {
      setPwdError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    alert('เปลี่ยนรหัสผ่านสำเร็จ!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <User className="h-6 w-6 text-brand-400" />
              <span>บัญชีผู้ใช้ (User Account & Security)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              จัดการข้อมูลส่วนตัว ความปลอดภัย และการยืนยันตัวตนสองชั้น (2FA)
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <User className="h-5 w-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">ข้อมูลโปรไฟล์</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">อีเมลที่ลงทะเบียน</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={user?.email || 'admin@tipdee.app'}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">ลิงก์หน้าโดเนทของคุณ: tipdee.app/u/{username}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อที่แสดง (Display Name)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">เปลี่ยนรหัสผ่าน</h3>
              </div>

              {pwdError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition-all"
                >
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>อัปเดตรหัสผ่าน</span>
                </button>
              </form>
            </div>
          </div>

          {/* 2FA Section */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">การยืนยันตัวตน 2 ขั้นตอน (Two-Factor Authentication / 2FA)</h3>
                  <p className="text-xs text-slate-400">เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วย Google Authenticator หรือ TOTP App</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                {twoFactorEnabled ? 'เปิดใช้งานอยู่ (Enabled)' : 'ปิดใช้งาน (Disabled)'}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-300">
                เมื่อเปิดใช้งาน คุณจะต้องกรอกรหัส 6 หลักจากแอป Authenticator ทุกครั้งที่เข้าสู่ระบบ
              </p>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${twoFactorEnabled ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-brand-500 text-black hover:bg-brand-400 font-black'}`}
              >
                {twoFactorEnabled ? 'ปิดการใช้งาน 2FA' : 'ตั้งค่าเปิดใช้งาน 2FA ทันที'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
