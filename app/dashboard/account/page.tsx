'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
} from 'lucide-react';

export default function UserAccountPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const username = sessionUser?.username || 'streamerza';

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [twoFactorSaving, setTwoFactorSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/account')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setEmail(data.data.email || '');
          setDisplayName(data.data.displayName || data.data.name || '');
          setTwoFactorEnabled(Boolean(data.data.twoFactorEnabled));
          setHasPassword(data.data.hasPassword);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setProfileError(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (err: any) {
      setProfileError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdSuccess(false), 3500);
      } else {
        setPwdError(data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      }
    } catch (err: any) {
      setPwdError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setTwoFactorSaving(true);
    try {
      const nextVal = !twoFactorEnabled;
      const res = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: nextVal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorEnabled(nextVal);
      } else {
        alert(data.error || 'ไม่สามารถเปลี่ยนสถานะ 2FA ได้');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setTwoFactorSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-200/80 pb-4">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <User className="h-6 w-6 text-emerald-600" />
              <span>บัญชีผู้ใช้และความปลอดภัย (User Account & Security)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              จัดการข้อมูลส่วนตัว เปลี่ยนรหัสผ่าน และการยืนยันตัวตนสองชั้น (2FA)
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">ข้อมูลโปรไฟล์</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">อีเมลที่ลงทะเบียน</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email || sessionUser?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">ลิงก์หน้าโดเนทของคุณ: tipdee.app/u/{username}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ชื่อที่แสดง (Display Name)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="เช่น PAnin_ToDD"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{profileSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">เปลี่ยนรหัสผ่าน</h3>
              </div>

              {pwdSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว</span>
                </div>
              )}

              {pwdError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {hasPassword && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่านปัจจุบัน</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold border border-slate-800 shadow-2xs transition-colors"
                >
                  {pwdSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4 text-amber-400" />}
                  <span>{pwdSaving ? 'กำลังอัปเดต...' : 'อัปเดตรหัสผ่าน'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* 2FA Section */}
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    การยืนยันตัวตน 2 ขั้นตอน (Two-Factor Authentication / 2FA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วย Google Authenticator หรือ TOTP App
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  twoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {twoFactorEnabled ? 'เปิดใช้งานอยู่ (Enabled)' : 'ปิดใช้งาน (Disabled)'}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-600">
                เมื่อเปิดใช้งาน คุณจะต้องกรอกรหัส 6 หลักจากแอป Authenticator ทุกครั้งที่เข้าสู่ระบบ
              </p>
              <button
                type="button"
                onClick={handleToggle2FA}
                disabled={twoFactorSaving}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  twoFactorEnabled
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 font-bold'
                }`}
              >
                {twoFactorSaving
                  ? 'กำลังประมวลผล...'
                  : twoFactorEnabled
                  ? 'ปิดการใช้งาน 2FA'
                  : 'ตั้งค่าเปิดใช้งาน 2FA ทันที'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
