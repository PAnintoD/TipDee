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
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={(form as any)[name]} onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors shadow-2xs"
      />
      {help && <p className="text-[11px] text-slate-500 mt-1">{help}</p>}
    </div>
  );

  const SectionCard = ({ icon: Icon, title, color = 'text-emerald-600', children }: any) => (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200"><Icon className={`h-4 w-4 ${color}`} /></div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
        <Navbar streamerId={username} />
        <div className="flex flex-1">
          <Sidebar streamerId={username} />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <Navbar streamerId={username} />
      <div className="flex flex-1">
        <Sidebar streamerId={username} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">ตั้งค่าช่องทางรับเงิน</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">จัดการช่องทางรับโดเนท บัญชีพร้อมเพย์ และการแจ้งเตือน</p>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>บันทึกการตั้งค่าสำเร็จเรียบร้อยแล้ว</span>
            </div>
          )}
          {saveError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
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
                  help="ชื่อที่แสดงให้ผู้บริจาคตรวจสอบก่อนกดยืนยัน"
                />
              </div>
              <BankSelector value={form.bankName} onChange={(v) => setForm((f) => ({ ...f, bankName: v }))} label="ธนาคารหลัก" />

              {/* QR Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-700">ตัวอย่าง QR Code พร้อมเพย์</p>
                  <button
                    type="button" onClick={refreshQR}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> รีเฟรช QR
                  </button>
                </div>
                {qrLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 text-emerald-600 animate-spin" /></div>
                ) : qrDataUrl ? (
                  <div className="flex justify-center">
                    <img src={qrDataUrl} alt="PromptPay QR" className="w-36 h-36 rounded-lg bg-white p-2 shadow-xs border border-slate-200" />
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-xs py-4">
                    บันทึกการตั้งค่าพร้อมเพย์ก่อนเพื่อดูตัวอย่าง QR Code
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Section 2: TrueMoney */}
            <SectionCard icon={Wallet} title="2. TrueMoney Wallet" color="text-amber-600">
              <InputRow
                label="เบอร์โทรศัพท์ TrueMoney Wallet"
                name="truemoneyPhone"
                placeholder="0812345678"
                help="ผู้ชมจะจ่ายเงินเข้า wallet ของคุณโดยตรง ไม่ผ่านระบบคนกลาง"
              />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                💡 เงินเข้า TrueMoney Wallet ของคุณโดยตรง TipDee ไม่เก็บค่าธรรมเนียมใด ๆ
              </div>
            </SectionCard>

            {/* Section 3: Slip Verification */}
            <SectionCard icon={ScanLine} title="3. ตรวจสอบสลิปอัตโนมัติ" color="text-sky-600">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900">เปิดใช้งานตรวจสลิปอัตโนมัติ</p>
                  <p className="text-xs text-slate-500 mt-0.5">ระบบจะสแกน QR Code บนสลิปธนาคารเพื่อยืนยันการโอน</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, enableAutoSlip: !f.enableAutoSlip }))}
                  className="transition-colors"
                >
                  {form.enableAutoSlip
                    ? <ToggleRight className="h-8 w-8 text-emerald-600" />
                    : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                </button>
              </div>

              <InputRow
                label="SlipOK API Key (ไม่บังคับ — เสริมความแม่นยำ)"
                name="slipApiKey"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                help="สำหรับสตรีมเมอร์ที่ต้องการเชื่อมต่อ API เพิ่มเติม"
              />
              <InputRow
                label="SlipOK Branch ID (ไม่บังคับ)"
                name="slipBranchId"
                placeholder="branch_01"
              />
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-xs">
                🛡️ ระบบตรวจสลิปมีระบบป้องกัน Duplicate — ป้องกันการนำสลิปเก่ามาใช้ซ้ำ 100%
              </div>
            </SectionCard>

            {/* Section 4: Webhook */}
            <SectionCard icon={Send} title="4. Webhook สำหรับนักพัฒนา" color="text-purple-600">
              <InputRow
                label="Webhook URL"
                name="webhookUrl"
                placeholder="https://your-bot.example.com/webhook"
                help="ระบบจะส่ง POST request ไปที่ URL นี้ทุกครั้งที่มีรายการโดเนทสำเร็จ"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={!form.webhookUrl || webhookTesting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs hover:bg-purple-100 disabled:opacity-40 transition-colors shadow-2xs"
                >
                  {webhookTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  ทดสอบ Webhook
                </button>
                {webhookResult && (
                  <span className={`text-xs ${webhookResult.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                    {webhookResult.ok ? '✅ สำเร็จ' : '❌ ผิดพลาด'}: {webhookResult.msg}
                  </span>
                )}
              </div>
            </SectionCard>

            {/* Section 5: Amount Settings */}
            <SectionCard icon={Sparkles} title="5. กำหนดยอดเงินโดเนท" color="text-emerald-600">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ยอดขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number" name="minAmount" value={form.minAmount} min={1}
                    onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors shadow-2xs"
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-xs"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
