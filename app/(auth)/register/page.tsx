'use client';

import { useState } from 'react';
import { Loader2, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'username') {
      setForm({ ...form, username: value.toLowerCase().replace(/[^a-z0-9_]/g, '') });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        username: form.username.toLowerCase(),
        displayName: form.displayName,
        password: form.password,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="surface-card p-6 sm:p-8 rounded-2xl shadow-xl text-center">
        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">สมัครสมาชิกสำเร็จ!</h2>
        <p className="text-slate-400 text-xs mb-6">เราได้ส่งอีเมลยืนยันไปที่ <span className="text-white font-medium">{form.email}</span> แล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ</p>
        <a href="/login" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors shadow-sm">
          ไปหน้าเข้าสู่ระบบ
        </a>
      </div>
    );
  }

  return (
    <div className="surface-card p-6 sm:p-8 rounded-2xl shadow-xl">
      <h1 className="text-xl font-bold tracking-tight text-white mb-1">สมัครสมาชิก</h1>
      <p className="text-slate-400 text-xs mb-6">สร้างบัญชีครีเอเตอร์และเริ่มรับโดเนทได้ทันที</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" required
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            ชื่อผู้ใช้ <span className="text-slate-500">(สำหรับ URL รับโดเนท)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">tipdee.app/u/</span>
            <input
              type="text" name="username" value={form.username} onChange={handleChange}
              placeholder="myusername" required
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 pl-24 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ใช้อักษรภาษาอังกฤษตัวพิมพ์เล็ก ตัวเลข และ _ เท่านั้น</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อช่องหรือนามปากกา</label>
          <input
            type="text" name="displayName" value={form.displayName} onChange={handleChange}
            placeholder="ชื่อช่องของคุณ เช่น GamerZ" required
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
              placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">ยืนยันรหัสผ่าน</label>
          <input
            type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            placeholder="••••••••" required
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          สมัครสมาชิก
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-5">
        มีบัญชีอยู่แล้ว?{' '}
        <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
          เข้าสู่ระบบ
        </a>
      </p>
    </div>
  );
}
