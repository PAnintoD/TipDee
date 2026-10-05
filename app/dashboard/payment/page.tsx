'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BankSelector } from '@/components/BankSelector';
import {
  Wallet, QrCode, Save, CheckCircle2, AlertCircle,
  Sparkles, ScanLine, Send, Loader2, RefreshCw,
  ToggleLeft, ToggleRight, Building2,
} from 'lucide-react';

interface FormState {
  promptpayId: string;
  accountName: string;
  bankCode: string;
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

  // Initial form state with empty strings - NO mock data
  const [form, setForm] = useState<FormState>({
    promptpayId: '',
    accountName: '',
    bankCode: '',
    truemoneyPhone: '',
    minAmount: 5,
    presetAmountsStr: '20, 50, 100, 300, 500, 1000',
    enableAutoSlip: true,
    slipApiKey: '',
    slipBranchId: '',
    webhookUrl: '',
  });

  // Fetch real payment settings from database on mount
  const loadChannels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payment/channels');
      const data = await res.json();

      if (data.success && data.data) {
        const s = data.data;
        setStreamerId(s.id || '');

        let presetStr = '20, 50, 100, 300, 500, 1000';
        try {
          if (Array.isArray(s.presetAmounts)) {
            presetStr = s.presetAmounts.join(', ');
          } else if (typeof s.presetAmounts === 'string' && s.presetAmounts.trim()) {
            const parsed = JSON.parse(s.presetAmounts);
            if (Array.isArray(parsed)) presetStr = parsed.join(', ');
          }
        } catch (e) {
          // ignore json parse error
        }

        const promptpayValue = s.promptpayId || s.promptpayTarget || '';
        const accountNameValue = s.accountName || s.promptpayName || '';
        const bankValue = s.bankCode || s.bankName || '';

        setForm({
          promptpayId: promptpayValue,
          accountName: accountNameValue,
          bankCode: bankValue,
          truemoneyPhone: s.truemoneyPhone || '',
          minAmount: s.minAmount ?? 5,
          presetAmountsStr: presetStr,
          enableAutoSlip: s.enableAutoSlip !== false,
          slipApiKey: s.slipApiKey || '',
          slipBranchId: s.slipBranchId || '',
          webhookUrl: s.webhookUrl || '',
        });

        if (s.promptpayQR) {
          setQrDataUrl(s.promptpayQR);
        } else if (promptpayValue) {
          // fetch dynamic QR if available
          fetchDynamicQR(promptpayValue);
        }
      }
    } catch (e) {
      console.error('Failed to load payment channels', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // Dynamic QR fetch helper
  const fetchDynamicQR = useCallback(async (target: string) => {
    const cleaned = target.trim().replace(/[^0-9]/g, '');
    if (cleaned.length === 10 || cleaned.length === 13 || cleaned.length === 15) {
      setQrLoading(true);
      try {
        const res = await fetch(`/api/payment/channels?target=${encodeURIComponent(cleaned)}`);
        const data = await res.json();
        if (data.success && data.qr) {
          setQrDataUrl(data.qr);
        }
      } catch (err) {
        console.error('Failed to generate preview QR', err);
      } finally {
        setQrLoading(false);
      }
    } else {
      setQrDataUrl('');
    }
  }, []);

  // Real-time dynamic QR code generation as user types PromptPay ID
  useEffect(() => {
    const rawTarget = form.promptpayId.trim();
    const cleaned = rawTarget.replace(/[^0-9]/g, '');

    if (!cleaned) {
      setQrDataUrl('');
      return;
    }

    if (cleaned.length === 10 || cleaned.length === 13 || cleaned.length === 15) {
      const timer = setTimeout(() => {
        fetchDynamicQR(cleaned);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [form.promptpayId, fetchDynamicQR]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Save payment settings via PUT/POST to /api/payment/channels
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const presetAmounts = form.presetAmountsStr
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const payload = {
      promptpayId: form.promptpayId.trim(),
      promptpayTarget: form.promptpayId.trim(),
      accountName: form.accountName.trim(),
      promptpayName: form.accountName.trim(),
      bankCode: form.bankCode,
      bankName: form.bankCode,
      truemoneyPhone: form.truemoneyPhone.trim(),
      minAmount: Number(form.minAmount) || 5,
      presetAmounts: presetAmounts.length > 0 ? presetAmounts : [20, 50, 100, 300, 500, 1000],
      enableAutoSlip: form.enableAutoSlip,
      slipApiKey: form.slipApiKey.trim(),
      slipBranchId: form.slipBranchId.trim(),
      webhookUrl: form.webhookUrl.trim(),
    };

    try {
      const res = await fetch('/api/payment/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSaving(false);

      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (data.data?.promptpayQR) {
          setQrDataUrl(data.data.promptpayQR);
        } else if (form.promptpayId.trim()) {
          fetchDynamicQR(form.promptpayId.trim());
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.error || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: any) {
      setIsSaving(false);
      setSaveError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  }

  async function handleTestWebhook() {
    if (!streamerId || !form.webhookUrl) return;
    setWebhookTesting(true);
    setWebhookResult(null);
    try {
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
      setWebhookResult({ ok: data.success, msg: data.message || 'ส่งข้อมูลเรียบร้อย' });
      setTimeout(() => setWebhookResult(null), 5000);
    } catch (e: any) {
      setWebhookTesting(false);
      setWebhookResult({ ok: false, msg: e.message || 'การเชื่อมต่อล้มเหลว' });
      setTimeout(() => setWebhookResult(null), 5000);
    }
  }

  const InputRow = ({ label, name, type = 'text', placeholder = '', help = '' }: any) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={(form as any)[name] ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors shadow-2xs"
      />
      {help && <p className="text-[11px] text-slate-500 mt-1">{help}</p>}
    </div>
  );

  const SectionCard = ({ icon: Icon, title, color = 'text-emerald-600', children }: any) => (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
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
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-28 bg-slate-50 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-xs sm:text-sm">กำลังโหลดข้อมูลช่องทางรับเงิน...</span>
            </div>
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
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              จัดการช่องทางรับโดเนท บัญชีพร้อมเพย์ และระบบตรวจสอบสลิปอัตโนมัติ
            </p>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>บันทึกการตั้งค่าช่องทางรับเงินลงฐานข้อมูลเรียบร้อยแล้ว</span>
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
                  label="เบอร์โทร / เลขบัตรประชาชน (PromptPay ID)"
                  name="promptpayId"
                  placeholder="เช่น 0812345678 หรือ 1234567890123"
                  help="รองรับเบอร์โทร 10 หลัก (08x...), เลขบัตร 13 หลัก หรือ e-Wallet ID 15 หลัก"
                />
                <InputRow
                  label="ชื่อบัญชีผู้รับเงิน (Account Name)"
                  name="accountName"
                  placeholder="เช่น นายสมชาย ใจดี"
                  help="ชื่อบัญชีที่ผู้บริจาคจะตรวจสอบตอนสแกนชำระเงิน"
                />
              </div>

              <BankSelector
                value={form.bankCode}
                onChange={(v) => setForm((f) => ({ ...f, bankCode: v }))}
                label="ธนาคารหลักของบัญชี"
              />

              {/* Dynamic QR Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-slate-700">ตัวอย่าง QR Code พร้อมเพย์ (สร้างแบบเรียลไทม์)</p>
                  </div>
                  {form.promptpayId.trim() && (
                    <button
                      type="button"
                      onClick={() => fetchDynamicQR(form.promptpayId)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`h-3 w-3 ${qrLoading ? 'animate-spin' : ''}`} /> รีเฟรช QR
                    </button>
                  )}
                </div>

                {qrLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500 text-xs">
                    <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                    <span>กำลังสร้าง QR Code ตามข้อมูลที่ระบุ...</span>
                  </div>
                ) : qrDataUrl ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 inline-block text-center">
                      <img
                        src={qrDataUrl}
                        alt="Dynamic PromptPay QR Code"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                      <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                          พร้อมเพย์
                        </span>
                        {form.accountName && (
                          <p className="text-xs font-semibold text-slate-800 mt-1">{form.accountName}</p>
                        )}
                        {form.promptpayId && (
                          <p className="text-[11px] text-slate-500 font-mono">{form.promptpayId}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      💡 QR Code นี้สร้างขึ้นอัตโนมัติตามเบอร์หรือรหัสที่กรอกด้านบน
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-lg bg-white/60">
                    <p className="text-xs font-medium text-slate-600">ยังไม่มีตัวอย่าง QR Code</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      กรอกหมายเลขพร้อมเพย์ (เบอร์โทร 10 หลัก หรือเลขบัตร 13 หลัก) เพื่อสร้าง QR Code อัตโนมัติ
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Section 2: TrueMoney */}
            <SectionCard icon={Wallet} title="2. TrueMoney Wallet" color="text-amber-600">
              <InputRow
                label="เบอร์โทรศัพท์ TrueMoney Wallet"
                name="truemoneyPhone"
                placeholder="เช่น 0812345678"
                help="ผู้ชมจะจ่ายเงินเข้ากระเป๋า TrueMoney Wallet ของคุณโดยตรง ไม่ผ่านตัวกลาง"
              />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                💡 เงินเข้า TrueMoney Wallet ของคุณโดยตรง TipDee ไม่หักค่าธรรมเนียมใด ๆ
              </div>
            </SectionCard>

            {/* Section 3: Slip Verification */}
            <SectionCard icon={ScanLine} title="3. ตรวจสอบสลิปอัตโนมัติ" color="text-sky-600">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900">เปิดใช้งานตรวจสลิปอัตโนมัติ</p>
                  <p className="text-xs text-slate-500 mt-0.5">ระบบจะสแกน QR Code บนสลิปธนาคารเพื่อยืนยันยอดเงินจริง</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, enableAutoSlip: !f.enableAutoSlip }))}
                  className="transition-colors"
                >
                  {form.enableAutoSlip ? (
                    <ToggleRight className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-slate-300" />
                  )}
                </button>
              </div>

              <InputRow
                label="SlipOK API Key (ไม่บังคับ — เสริมความแม่นยำ)"
                name="slipApiKey"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                help="สำหรับสตรีมเมอร์ที่ต้องการเชื่อมต่อ API ตรวจสลิปภายนอกเพิ่มเติม"
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
                help="ระบบจะส่ง HTTP POST ไปที่ URL นี้ทุกครั้งที่มีรายการโดเนทสำเร็จ"
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
                    type="number"
                    name="minAmount"
                    value={form.minAmount}
                    min={1}
                    onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors shadow-2xs"
                  />
                </div>
                <InputRow
                  label="ปุ่มจำนวนเงินสำเร็จรูป (คั่นด้วยจุลภาค)"
                  name="presetAmountsStr"
                  placeholder="20, 50, 100, 300, 500, 1000"
                  help="ปุ่มลัดเลือกจำนวนเงินในหน้าโดเนท"
                />
              </div>
            </SectionCard>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>กำลังบันทึกข้อมูลลงฐานข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>บันทึกการตั้งค่าช่องทางรับเงิน</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
