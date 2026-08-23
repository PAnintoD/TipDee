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
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <CheckCircle className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
        <p className="text-slate-400">กำลังพาคุณไปหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">ตั้งรหัสผ่านใหม่</h1>
      <p className="text-slate-400 text-sm mb-6">กรุณาตั้งรหัสผ่านใหม่ที่คาดเดายาก</p>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">รหัสผ่านใหม่</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
          บันทึกรหัสผ่านใหม่
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
