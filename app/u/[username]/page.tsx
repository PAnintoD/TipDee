'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  QrCode,
  Gift,
  Zap,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  UploadCloud,
  FileImage,
  X,
  ScanLine,
  Receipt,
} from 'lucide-react';
import { YouTubeIcon, TwitchIcon, FacebookIcon } from '@/components/SocialIcons';

export default function PublicDonatePage() {
  const params = useParams();
  const username = (params?.username as string) || 'streamerza';

  const [streamer, setStreamer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amount, setAmount] = useState<number | string>(50);
  const [message, setMessage] = useState('');
  const [enableTTS, setEnableTTS] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'slip' | 'truemoney' | 'test'>('promptpay');
  const [voucherUrl, setVoucherUrl] = useState('');

  // Slip Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string>('');
  const [isScanningSlip, setIsScanningSlip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment Flow State
  const [step, setStep] = useState<'form' | 'pay' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetch(`/api/streamer?id=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStreamer(data.data);
          if (data.data.presetAmounts && data.data.presetAmounts.length > 0) {
            setAmount(data.data.presetAmounts[1] || data.data.presetAmounts[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  const presetAmounts = streamer?.presetAmounts || [20, 50, 100, 300, 500, 1000];
  const goal = streamer?.goalSettings || null;
  const goalPercent = goal
    ? Math.min(100, Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100))
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
      setErrorMessage('');
    }
  };

  const handleRemoveFile = () => {
    setSlipFile(null);
    setSlipPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'],
      });
    } catch (e) {}
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < (streamer?.minAmount || 1)) {
      setErrorMessage(`ยอดโดเนทขั้นต่ำคือ ${streamer?.minAmount || 5} บาท`);
      return;
    }

    const finalDonorName = isAnonymous ? 'ผู้ไม่ประสงค์ออกนาม' : donorName.trim() || 'ผู้ไม่ประสงค์ออกนาม';

    // If Slip Upload method
    if (paymentMethod === 'slip') {
      if (!slipFile) {
        setErrorMessage('กรุณาเลือกไฟล์ภาพสลิปโอนเงิน');
        return;
      }

      setIsScanningSlip(true);
      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append('file', slipFile);
        formData.append('streamerId', username);
        formData.append('donorName', finalDonorName);
        formData.append('amount', numAmount.toString());
        formData.append('message', message);
        formData.append('enableTTS', enableTTS.toString());

        const res = await fetch('/api/slip/verify', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          setCurrentDonation(data.data.donation);
          triggerConfetti();
          setStep('success');
        } else {
          setErrorMessage(data.error || 'ตรวจสอบสลิปไม่สำเร็จ');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');
      } finally {
        setIsScanningSlip(false);
        setIsProcessing(false);
      }
      return;
    }

    // Other payment methods (PromptPay QR, TrueMoney, Test)
    setIsProcessing(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId: username,
          donorName: finalDonorName,
          amount: numAmount,
          message,
          paymentMethod,
          enableTTS,
          autoComplete: paymentMethod === 'test',
          voucherUrl: paymentMethod === 'truemoney' ? voucherUrl : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentDonation(data.data.donation);
        setQrDataUrl(data.data.qrDataUrl || '');

        if (data.data.donation.status === 'completed' || paymentMethod === 'test') {
          triggerConfetti();
          setStep('success');
        } else {
          setStep('pay');
        }
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!currentDonation) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/donations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: currentDonation.id }),
      });

      const data = await res.json();
      if (data.success) {
        triggerConfetti();
        setStep('success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setMessage('');
    setCurrentDonation(null);
    setQrDataUrl('');
    setErrorMessage('');
    handleRemoveFile();
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Brand Watermark */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <span>ขับเคลื่อนด้วย</span>
        <span className="font-extrabold text-white flex items-center gap-1">
          Easy<span className="text-brand-400">Donate</span>
        </span>
        <ShieldCheck className="h-4 w-4 text-brand-400" />
      </div>

      <div className="w-full max-w-xl space-y-5">
        {/* Streamer Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl backdrop-blur-xl">
          {/* Banner */}
          <div
            className="h-32 sm:h-40 w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                streamer?.bannerUrl ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
              })`,
            }}
          >
            <div className="h-full w-full bg-gradient-to-t from-[#0e1219] via-black/30 to-transparent" />
          </div>

          {/* Profile details */}
          <div className="p-6 pt-0 relative flex flex-col items-center text-center -mt-12 space-y-3">
            <img
              src={
                streamer?.avatarUrl ||
                'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80'
              }
              alt={streamer?.displayName}
              className="h-24 w-24 rounded-2xl object-cover border-4 border-[#0e1219] shadow-2xl ring-2 ring-brand-500/50"
            />

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>{streamer?.displayName || 'StreamerZa TH'}</span>
                <span className="inline-flex h-4 w-4 rounded-full bg-brand-500 items-center justify-center text-[10px] text-white">✓</span>
              </h1>
              <p className="text-xs text-brand-400 font-mono mt-0.5">@{username}</p>
            </div>

            {streamer?.bio && (
              <p className="text-xs text-slate-300 max-w-md leading-relaxed px-2">
                {streamer.bio}
              </p>
            )}

            {/* Social Links */}
            {streamer?.socialLinks && (
              <div className="flex items-center gap-2 pt-1">
                {streamer.socialLinks.youtube && (
                  <a
                    href={streamer.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                  </a>
                )}
                {streamer.socialLinks.twitch && (
                  <a
                    href={streamer.socialLinks.twitch}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    <TwitchIcon className="h-4 w-4" />
                  </a>
                )}
                {streamer.socialLinks.facebook && (
                  <a
                    href={streamer.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
                {streamer.socialLinks.discord && (
                  <a
                    href={streamer.socialLinks.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {/* Goal Card if active */}
            {goal && (
              <div className="w-full mt-2 p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                    <span>{goal.title}</span>
                  </span>
                  <span className="text-brand-400">{goalPercent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-700"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{goal.currentAmount?.toLocaleString('th-TH')} ฿</span>
                  <span>เป้าหมาย {goal.targetAmount?.toLocaleString('th-TH')} ฿</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-bounce-short">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Donation Form */}
        {step === 'form' && (
          <form
            onSubmit={handleSubmitForm}
            className="rounded-3xl border border-white/10 bg-[#0e1219]/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5"
          >
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>กรอกข้อมูลสนับสนุน (Donate)</span>
              </h2>
              <p className="text-xs text-slate-400">
                ข้อความและชื่อของคุณจะขึ้นแจ้งเตือนบนหน้าจอสตรีมเมอร์ทันที
              </p>
            </div>

            {/* Donor Name */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-200">ชื่อของคุณ (Donor Name)</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-0 h-3.5 w-3.5 bg-slate-800 border-slate-700"
                  />
                  <span>ไม่ระบุตัวตน (Anonymous)</span>
                </label>
              </div>

              {!isAnonymous && (
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="พิมพ์ชื่อหรือฉายาของคุณ..."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required={!isAnonymous}
                />
              )}
            </div>

            {/* Amount Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-200">จำนวนเงิน (Amount บาท)</label>

              {/* Preset Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presetAmounts.map((p: number) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      Number(amount) === p
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105'
                        : 'bg-slate-900 border border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {p} ฿
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative mt-2">
                <input
                  type="number"
                  min={streamer?.minAmount || 5}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`ระบุจำนวนเงิน (ขั้นต่ำ ${streamer?.minAmount || 5} บาท)`}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 pl-4 pr-12 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  บาท
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-200">ข้อความถึงสตรีมเมอร์</label>
                <span className="text-[11px] text-slate-500">{message.length}/200 ตัวอักษร</span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="พิมพ์ข้อความส่งกำลังใจ หรือขอเพลง..."
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* TTS Option */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/10 cursor-pointer hover:bg-slate-850 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                  {enableTTS ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">เปิดอ่านข้อความออกเสียง (TTS)</span>
                  <span className="text-[11px] text-slate-400">เสียงระบบจะอ่านชื่อและข้อความบนสตรีม</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableTTS}
                onChange={(e) => setEnableTTS(e.target.checked)}
                className="rounded text-brand-500 focus:ring-0 h-4 w-4 bg-slate-800 border-slate-700"
              />
            </label>

            {/* Payment Method Selector (Production Real Only) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">เลือกช่องทางการชำระเงินจริง</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* PromptPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'promptpay'
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-md shadow-blue-500/10'
                      : 'border-white/5 bg-slate-900/80 hover:border-white/15'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">พร้อมเพย์ QR</span>
                    <span className="text-[10px] text-slate-400">สแกนจ่ายทันที</span>
                  </div>
                </button>

                {/* Auto Slip Scan */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('slip')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'slip'
                      ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'border-white/5 bg-slate-900/80 hover:border-white/15'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <ScanLine className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">สแกนสลิปออโต้</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">แนบสลิปผ่านทันที</span>
                  </div>
                </button>

                {/* TrueMoney */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('truemoney')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'truemoney'
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500 shadow-md shadow-amber-500/10'
                      : 'border-white/5 bg-slate-900/80 hover:border-white/15'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">TrueMoney</span>
                    <span className="text-[10px] text-slate-400">ซองของขวัญ</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Slip Upload Dropzone */}
            {paymentMethod === 'slip' && (
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4" /> อัปโหลดภาพสลิปโอนเงินธนาคาร
                  </span>
                  <span className="text-[10px] text-slate-400">รองรับสลิปทุกธนาคารในไทย</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!slipPreviewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-6 text-center space-y-2 bg-slate-900/60 hover:bg-slate-900 transition-colors"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">คลิกเพื่อเลือกไฟล์รูปภาพสลิป หรือลากรูปมาวางที่นี่</p>
                      <p className="text-[11px] text-slate-400">รองรับไฟล์ PNG, JPG (ระบบจะสแกน QR Code บนสลิปอัตโนมัติ)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={slipPreviewUrl} alt="Slip Preview" className="h-16 w-16 object-cover rounded-xl border border-white/10" />
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{slipFile?.name}</p>
                        <p className="text-[11px] text-emerald-400 font-medium">
                          {(slipFile?.size ? slipFile.size / 1024 : 0).toFixed(1)} KB (พร้อมสแกน)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TrueMoney Voucher Input */}
            {paymentMethod === 'truemoney' && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                <label className="text-xs font-semibold text-amber-300">วางลิงก์ซองของขวัญ TrueMoney:</label>
                <input
                  type="url"
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || isScanningSlip}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <span>
                {isScanningSlip
                  ? '🔍 กำลังสแกน QR Code และตรวจสอบสลิป...'
                  : isProcessing
                  ? 'กำลังประมวลผล...'
                  : `โดเนท ${Number(amount || 0).toLocaleString('th-TH')} บาท`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Payment (PromptPay QR) */}
        {step === 'pay' && currentDonation && (
          <div className="rounded-3xl border border-white/10 bg-[#0e1219]/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl text-center space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <QrCode className="h-3.5 w-3.5" />
                <span>สแกนเพื่อชำระเงิน (PromptPay Dynamic QR)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                ยอดชำระ: <span className="text-brand-400">{currentDonation.amount.toLocaleString('th-TH')} บาท</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                บัญชี: <strong className="text-slate-200">{streamer?.promptpayName || 'สตรีมเมอร์'}</strong>
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="mx-auto w-64 p-4 rounded-2xl bg-white shadow-2xl flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase">Thai QR Payment</span>
                <span className="text-[10px] font-bold text-blue-600 font-mono">PromptPay</span>
              </div>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="PromptPay QR Code" className="h-56 w-56 object-contain" />
              ) : (
                <div className="h-56 w-56 flex items-center justify-center text-slate-400 text-xs">
                  กำลังสร้าง QR...
                </div>
              )}
              <span className="text-[10px] text-slate-500 mt-2">สแกนด้วยแอปธนาคารทุกแห่งในไทย</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmPaid}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{isProcessing ? 'กำลังยืนยัน...' : 'โอนเงินเรียบร้อยแล้ว (แจ้งเตือนสตรีมเมอร์ทันที)'}</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                &larr; กลับไปแก้ไขข้อมูล
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 'success' && currentDonation && (
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-[#0e1219]/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-alert-pop">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">ขอบคุณสำหรับการโดเนท! 🎉</h2>
              <p className="text-xs text-emerald-400 font-semibold">
                {currentDonation.paymentMethod === 'slip' ? 'สลิปได้รับการยืนยันและส่งขึ้นจอ OBS เรียบร้อยแล้ว' : 'ข้อความและเสียงแจ้งเตือนของคุณถูกส่งขึ้นหน้าจอ OBS เรียบร้อยแล้ว'}
              </p>
            </div>

            {/* Summary Receipt Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">ผู้บริจาค:</span>
                <span className="font-bold text-white">{currentDonation.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ยอดเงิน:</span>
                <span className="font-extrabold text-brand-400">{currentDonation.amount.toLocaleString('th-TH')} บาท</span>
              </div>
              {currentDonation.message && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-400 block mb-1">ข้อความ:</span>
                  <p className="text-slate-200 italic bg-black/40 p-2 rounded-lg">"{currentDonation.message}"</p>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              โดเนทอีกครั้ง &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
