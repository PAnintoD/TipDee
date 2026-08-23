'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BankSelector } from '@/components/BankSelector';
import {
  Wallet, QrCode, Save, CheckCircle2, AlertCircle,
  Sparkles, ScanLine, ShieldCheck, Key, Webhook,
  ToggleLeft, ToggleRight, RefreshCw, Send, Loader2,
} from 'lucide-react';

interface FormState {
  promptpayTarget: string;
  promptpayName: string;
  bankName: string;
  truemoneyPhone: string;
  minAmount: number;
  presetAmountsStr: string;
  enableAutoSlip: boolean;
  slipApiKey: string;
  slipBranchId: string;
  webhookUrl: string;
}

export default function PaymentPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username ?? '';

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [streamerId, setStreamerId] = useState('');

  const [form, setForm] = useState<FormState>({
    promptpayTarget: '',
    promptpayName: '',
    bankName: '',
    truemoneyPhone: '',
    minAmount: 5,
    presetAmountsStr: '20, 50, 100, 300, 500, 1000',
    enableAutoSlip: true,
    slipApiKey: '',
    slipBranchId: '',
    webhookUrl: '',
  });

  useEffect(() => {
    fetch('/api/payment/channels')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const s = data.data;
          setStreamerId(s.id);
          setForm({
            promptpayTarget: s.promptpayTarget || '',
            promptpayName: s.promptpayName || '',
            bankName: '',
            truemoneyPhone: s.truemoneyPhone || '',
            minAmount: s.minAmount || 5,
            presetAmountsStr: s.presetAmounts
              ? JSON.parse(s.presetAmounts).join(', ')
              : '20, 50, 100, 300, 500, 1000',
            enableAutoSlip: s.enableAutoSlip !== false,
            slipApiKey: s.slipApiKey || '',
            slipBranchId: s.slipBranchId || '',
            webhookUrl: s.webhookUrl || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshQR = useCallback(() => {
    if (!username) return;
    setQrLoading(true);
    fetch(`/api/streamer?id=${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.promptpayQR) {
          setQrDataUrl(data.data.promptpayQR);
        }
      })
      .finally(() => setQrLoading(false));
  }, [username]);

  useEffect(() => {
    if (username) refreshQR();
  }, [username, refreshQR]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const presetAmounts = form.presetAmountsStr
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const res = await fetch('/api/payment/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptpayTarget: form.promptpayTarget,
        promptpayName: form.promptpayName,
        truemoneyPhone: form.truemoneyPhone,
        minAmount: form.minAmount,
        presetAmounts,
        enableAutoSlip: form.enableAutoSlip,
        slipApiKey: form.slipApiKey,
        slipBranchId: form.slipBranchId,
        webhookUrl: form.webhookUrl,
      }),
    });

    const data = await res.json();
    setIsSaving(false);

    if (res.ok) {
      setSaveSuccess(true);
      refreshQR();
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(data.error || 'บันทึกไม่สำเร็จ');
    }
  }

  async function handleTestWebhook() {
    if (!streamerId || !form.webhookUrl) return;
    setWebhookTesting(true);
    setWebhookResult(null);
    const res = await fetch('/api/webhook/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamerId,
        donation: {
          id: `test_${Date.now()}`,
          donorName: 'ทดสอบ Webhook',
          amount: 100,
          message: 'ทดสอบ Webhook จาก TipDee Dashboard',
          paymentMethod: 'test',
          createdAt: new Date().toISOString(),
        },
      }),
    });
    const data = await res.json();
    setWebhookTesting(false);
    setWebhookResult({ ok: data.success, msg: data.message });
    setTimeout(() => setWebhookResult(null), 5000);
  }

  const InputRow = ({ label, name, type = 'text', placeholder = '', help = '' }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={(form as any)[name]} onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
      />
      {help && <p className="text-xs text-slate-500 mt-1">{help}</p>}
    </div>
  );

  const SectionCard = ({ icon: Icon, title, color = 'text-brand-400', children }: any) => (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 bg-slate-800 rounded-lg`}><Icon className={`h-5 w-5 ${color}`} /></div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">ตั้งค่าช่องทางรับเงิน</h1>
            <p className="text-slate-400 text-sm mt-1">จัดการช่องทางรับโดเนทและการแจ้งเตือน</p>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center gap-3 text-brand-400">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>บันทึกการตั้งค่าสำเร็จแล้ว!</span>
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: PromptPay */}
            <SectionCard icon={QrCode} title="1. ตั้งค่าพร้อมเพย์ (PromptPay)">
              <div className="grid sm:grid-cols-2 gap-4">
                <InputRow
                  label="เบอร์ / เลขบัตรประชาชน (PromptPay ID)"
                  name="promptpayTarget"
                  placeholder="0812345678"
                  help="รองรับเบอร์โทร 10 หลัก (08x...), เลขบัตร 13 หลัก"
                />
                <InputRow
                  label="ชื่อบัญชีผู้รับเงิน (Account Name)"
                  name="promptpayName"
                  placeholder="ชื่อ-นามสกุล"
                  help="ชื่อที่แสดงให้ผู้บริจาคตรวจสอบ"
                />
              </div>
              <BankSelector value={form.bankName} onChange={(v) => setForm((f) => ({ ...f, bankName: v }))} label="ธนาคารหลัก" />

              {/* QR Preview */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-300">ตัวอย่าง QR Code</p>
                  <button
                    type="button" onClick={refreshQR}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> รีเฟรช
                  </button>
                </div>
                {qrLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-brand-400 animate-spin" /></div>
                ) : qrDataUrl ? (
                  <div className="flex justify-center">
                    <img src={qrDataUrl} alt="PromptPay QR" className="w-40 h-40 rounded-lg bg-white p-2" />
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-sm py-6">
                    บันทึกการตั้งค่าพร้อมเพย์ก่อนเพื่อดู QR Code
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Section 2: TrueMoney */}
            <SectionCard icon={Wallet} title="2. TrueMoney Wallet" color="text-orange-400">
              <InputRow
                label="เบอร์โทรศัพท์ TrueMoney Wallet"
                name="truemoneyPhone"
                placeholder="0812345678"
                help="ผู้ชมจะจ่ายเงินเข้า wallet ของคุณโดยตรง ไม่ผ่านระบบ"
              />
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-300 text-xs">
                💡 เงินเข้า TrueMoney Wallet ของคุณโดยตรง TipDee ไม่เก็บค่าธรรมเนียมใด ๆ
              </div>
            </SectionCard>

            {/* Section 3: Slip Verification */}
            <SectionCard icon={ScanLine} title="3. ตรวจสอบสลิปอัตโนมัติ" color="text-blue-400">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                <div>
                  <p className="font-medium text-white">เปิดใช้งานตรวจสลิปอัตโนมัติ</p>
                  <p className="text-xs text-slate-400 mt-0.5">ระบบจะสแกน QR Code ในสลิปเพื่อยืนยันการโอน</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, enableAutoSlip: !f.enableAutoSlip }))}
                  className="transition-colors"
                >
                  {form.enableAutoSlip
                    ? <ToggleRight className="h-9 w-9 text-brand-400" />
                    : <ToggleLeft className="h-9 w-9 text-slate-600" />}
                </button>
              </div>

              <InputRow
                label="SlipOK API Key (ไม่บังคับ — ตรวจสอบแม่นยำสูง)"
                name="slipApiKey"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                help="สมัครที่ slipok.com เพื่อรับ API Key ตรวจสลิปอัตโนมัติ"
              />
              <InputRow
                label="SlipOK Branch ID (ไม่บังคับ)"
                name="slipBranchId"
                placeholder="branch_01"
              />
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs">
                🛡️ ระบบตรวจสลิปมีการป้องกัน Duplicate — ไม่สามารถใช้สลิปเดิมซ้ำได้
              </div>
            </SectionCard>

            {/* Section 4: Webhook */}
            <SectionCard icon={Send} title="4. Webhook (Developer)" color="text-purple-400">
              <InputRow
                label="Webhook URL"
                name="webhookUrl"
                placeholder="https://your-bot.example.com/webhook"
                help="ระบบจะส่ง POST request ไปที่ URL นี้ทุกครั้งที่มีโดเนทเข้า"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={!form.webhookUrl || webhookTesting}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm hover:bg-purple-600/30 disabled:opacity-40 transition-colors"
                >
                  {webhookTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  ทดสอบ Webhook
                </button>
                {webhookResult && (
                  <span className={`text-sm ${webhookResult.ok ? 'text-brand-400' : 'text-red-400'}`}>
                    {webhookResult.ok ? '✅' : '❌'} {webhookResult.msg}
                  </span>
                )}
              </div>
              <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-400 font-mono overflow-x-auto">
                {`POST ${form.webhookUrl || 'https://your-url.com/webhook'}\n{ "event": "donation.completed", "donation": { "donorName": "...", "amount": 100 } }`}
              </div>
            </SectionCard>

            {/* Section 5: Amount Settings */}
            <SectionCard icon={Sparkles} title="5. ตั้งค่าจำนวนเงิน" color="text-yellow-400">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    ยอดขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number" name="minAmount" value={form.minAmount} min={1}
                    onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <InputRow
                  label="ปุ่มจำนวนเงินสำเร็จรูป (คั่นด้วยจุลภาค)"
                  name="presetAmountsStr"
                  placeholder="20, 50, 100, 300, 500, 1000"
                />
              </div>
            </SectionCard>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
