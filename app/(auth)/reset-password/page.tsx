'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); } else { setSuccess(true); setTimeout(() => router.push('/login'), 3000); }
  }

  if (success) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <CheckCircle className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
        <p className="text-slate-500 text-xs">กำลังพาคุณไปหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-1">ตั้งรหัสผ่านใหม่</h1>
      <p className="text-slate-500 text-xs mb-6">กรุณาตั้งรหัสผ่านใหม่ที่คาดเดายาก</p>
      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่านใหม่</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-2xs transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-2xs transition-colors" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          บันทึกรหัสผ่านใหม่
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
