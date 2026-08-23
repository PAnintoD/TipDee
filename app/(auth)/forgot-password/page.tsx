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
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <CheckCircle className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">ส่งอีเมลแล้ว!</h2>
        <p className="text-slate-400 mb-6">หากอีเมล <span className="text-white">{email}</span> มีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านภายในไม่กี่นาที</p>
        <a href="/login" className="text-brand-400 hover:text-brand-300 text-sm">← กลับไปเข้าสู่ระบบ</a>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
      <a href="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> กลับ
      </a>
      <h1 className="text-2xl font-bold text-white mb-1">ลืมรหัสผ่าน?</h1>
      <p className="text-slate-400 text-sm mb-6">ใส่อีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
