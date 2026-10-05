'use client';

import { useState } from 'react';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <CheckCircle className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">ส่งอีเมลแล้ว!</h2>
        <p className="text-slate-500 text-xs mb-6">หากอีเมล <span className="text-slate-900 font-semibold">{email}</span> มีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านภายในไม่กี่นาที</p>
        <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs inline-flex items-center gap-1">← กลับไปเข้าสู่ระบบ</a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
      <a href="/login" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs mb-4 transition-colors font-medium">
        <ArrowLeft className="h-3.5 w-3.5" /> กลับไปเข้าสู่ระบบ
      </a>
      <h1 className="text-xl font-bold text-slate-900 mb-1">ลืมรหัสผ่าน?</h1>
      <p className="text-slate-500 text-xs mb-6">ใส่อีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">อีเมล</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-2xs transition-colors"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
