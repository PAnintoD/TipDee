'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Wallet,
  QrCode,
  Gift,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ScanLine,
  ShieldCheck,
  Key,
} from 'lucide-react';

export default function PaymentPage() {
  const streamerId = 'streamerza';
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    promptpayTarget: '0812345678',
    promptpayName: 'สตรีมเมอร์ ซ่า',
    truemoneyPhone: '0812345678',
    minAmount: 5,
    presetAmountsStr: '20, 50, 100, 300, 500, 1000',
    enableAutoSlip: true,
    slipApiKey: '',
    slipBranchId: '',
  });

  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setForm({
            promptpayTarget: data.data.promptpayTarget || '0812345678',
            promptpayName: data.data.promptpayName || '',
            truemoneyPhone: data.data.truemoneyPhone || '',
            minAmount: data.data.minAmount || 5,
            presetAmountsStr: (data.data.presetAmounts || [20, 50, 100, 300, 500, 1000]).join(', '),
            enableAutoSlip: data.data.enableAutoSlip !== false,
            slipApiKey: data.data.slipApiKey || '',
            slipBranchId: data.data.slipBranchId || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const presetAmounts = form.presetAmountsStr
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      const res = await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: streamerId,
          promptpayTarget: form.promptpayTarget.trim(),
          promptpayName: form.promptpayName.trim(),
          truemoneyPhone: form.truemoneyPhone.trim(),
          minAmount: Number(form.minAmount) || 5,
          presetAmounts,
          enableAutoSlip: form.enableAutoSlip,
          slipApiKey: form.slipApiKey.trim(),
          slipBranchId: form.slipBranchId.trim(),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Wallet className="h-6 w-6 text-brand-400" />
                <span>บัญชีรับเงินและระบบตรวจสลิป (Payment & Slip Engine)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ตั้งค่าบัญชี PromptPay, TrueMoney และระบบสแกนสลิปอัจฉริยะแบบป้องกันสลิปซ้ำ
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* PromptPay Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0e1219]/90 space-y-5">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. ตั้งค่าพร้อมเพย์ (PromptPay Dynamic QR)</h3>
                  <p className="text-xs text-slate-400">ระบบจะสร้าง Dynamic QR Code ระบุยอดเงินอัตโนมัติตามมาตรฐานธนาคารไทย</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    เบอร์พร้อมเพย์ หรือ เลขบัตรประชาชน (PromptPay ID):
                  </label>
                  <input
                    type="text"
                    value={form.promptpayTarget}
                    onChange={(e) => setForm({ ...form, promptpayTarget: e.target.value })}
                    placeholder="เช่น 0812345678 หรือ 1100400xxxxxx"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    รองรับเบอร์โทร 10 หลัก (08x...), เลขบัตร 13 หลัก, หรือ e-Wallet ID
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ชื่อบัญชีผู้รับเงิน (Account Name):
                  </label>
                  <input
                    type="text"
                    value={form.promptpayName}
                    onChange={(e) => setForm({ ...form, promptpayName: e.target.value })}
                    placeholder="เช่น นายสตรีมเมอร์ สู้ไม่ถอย"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ชื่อจะแสดงบนหน้าชำระเงินเพื่อให้ผู้บริจาคตรวจทาน
                  </p>
                </div>
              </div>
            </div>

            {/* Slip Verification Settings Card */}
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-[#0e1219]/90 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ScanLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>2. ระบบสแกนและตรวจสอบสลิปอัตโนมัติ (Slip Scanner & Anti-Duplicate)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                        Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      ถอดรหัส QR Code บนสลิปธนาคาร ป้องกันการอัปโหลดสลิปซ้ำ และยิงแจ้งเตือน OBS อัตโนมัติ
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableAutoSlip}
                    onChange={(e) => setForm({ ...form, enableAutoSlip: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {form.enableAutoSlip && (
                <div className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Smart Built-in Slip Scanner (ทำงานอัตโนมัติ 100%)</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      ระบบจะสแกน QR Code จากภาพสลิปที่คนดูแนบเข้ามา ตรวจสอบความถูกต้องและแฮชสลิป หากสลิปเดิมถูกนำมาใช้ซ้ำระบบจะบล็อกทันทีโดยอัตโนมัติ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-brand-400" /> SlipOK API Key (ตัวเลือกเสริม):
                      </label>
                      <input
                        type="text"
                        value={form.slipApiKey}
                        onChange={(e) => setForm({ ...form, slipApiKey: e.target.value })}
                        placeholder="กรอก API Key จาก slipok.com (ถ้ามี)"
                        className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        สำหรับตรวจเช็คการรับเงินจริงกับธนาคารแบบ Real-time (ไม่ใส่ก็ได้ ระบบใช้ Smart Scanner ในตัว)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        SlipOK Branch ID (ตัวเลือกเสริม):
                      </label>
                      <input
                        type="text"
                        value={form.slipBranchId}
                        onChange={(e) => setForm({ ...form, slipBranchId: e.target.value })}
                        placeholder="เช่น 1234"
                        className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TrueMoney Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0e1219]/90 space-y-5">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">3. ซองของขวัญทรูมันนี่ (TrueMoney Gift Voucher)</h3>
                  <p className="text-xs text-slate-400">อนุญาตให้ผู้ชมโดเนทผ่านลิงก์ซองของขวัญ TrueMoney</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เบอร์โทรศัพท์ TrueMoney Wallet:
                </label>
                <input
                  type="text"
                  value={form.truemoneyPhone}
                  onChange={(e) => setForm({ ...form, truemoneyPhone: e.target.value })}
                  placeholder="เช่น 0812345678"
                  className="w-full max-w-md rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Constraints Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0e1219]/90 space-y-5">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">4. เงื่อนไขและปุ่มยอดเงินแนะนำ (Donation Rules)</h3>
                  <p className="text-xs text-slate-400">กำหนดยอดขั้นต่ำและปุ่มลัดจำนวนเงินบนหน้าโดเนท</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ยอดโดเนทขั้นต่ำ (Min Amount บาท):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.minAmount}
                    onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ปุ่มลัดจำนวนเงินแนะนำ (คั่นด้วยเครื่องหมายจุลภาค ,):
                  </label>
                  <input
                    type="text"
                    value={form.presetAmountsStr}
                    onChange={(e) => setForm({ ...form, presetAmountsStr: e.target.value })}
                    placeholder="20, 50, 100, 300, 500, 1000"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
