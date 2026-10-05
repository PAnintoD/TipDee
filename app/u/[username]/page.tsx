'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  QrCode,
  Gift,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  X,
  ScanLine,
  Receipt,
  RotateCcw,
  ArrowLeft,
  CheckCheck,
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
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'slip' | 'truemoney'>('promptpay');
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

  // TrueMoney QR
  const [truemoneyQR, setTruemoneyQR] = useState('');
  const [truemoneyUrl, setTruemoneyUrl] = useState('');

  useEffect(() => {
    // Load saved donor name
    try {
      const saved = localStorage.getItem('tipdee_donor_name');
      if (saved) setDonorName(saved);
    } catch {}

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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#22c55e', '#3b82f6', '#f59e0b'],
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
    if (!isAnonymous && donorName.trim()) {
      try { localStorage.setItem('tipdee_donor_name', donorName.trim()); } catch {}
    }

    // Slip Upload method
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
          setErrorMessage(data.error || 'ตรวจสอบสลิปไม่สำเร็จ กรุณาตรวจสอบว่า QR Code บนสลิปชัดเจน');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');
      } finally {
        setIsScanningSlip(false);
        setIsProcessing(false);
      }
      return;
    }

    // Other payment methods (PromptPay QR, TrueMoney)
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentDonation(data.data.donation);
        setQrDataUrl(data.data.qrDataUrl || '');

        if (data.data.donation.status === 'completed') {
          triggerConfetti();
          setStep('success');
        } else {
          setStep('pay');
        }
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-medium">
          <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>กำลังโหลดข้อมูลหน้าโดเนท...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center py-8 px-4 sm:px-6 font-sans">
      {/* Platform Branding Badge */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <span>ขับเคลื่อนด้วย</span>
        <span className="font-bold text-slate-900 flex items-center gap-1">
          Tip<span className="text-emerald-600">Dee</span>
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
      </div>

      <div className="w-full max-w-xl space-y-4">
        {/* Streamer Profile Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {/* Banner */}
          <div
            className="h-28 sm:h-36 w-full bg-cover bg-center relative bg-gradient-to-r from-emerald-100 via-slate-100 to-slate-200"
            style={
              streamer?.bannerUrl
                ? { backgroundImage: `url(${streamer.bannerUrl})` }
                : undefined
            }
          >
            <div className="h-full w-full bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Profile details */}
          <div className="px-5 pb-5 pt-0 relative flex flex-col items-center text-center -mt-10 space-y-2.5">
            {streamer?.avatarUrl ? (
              <img
                src={streamer.avatarUrl}
                alt={streamer?.displayName || username}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border-2 border-white shadow-md">
                {(streamer?.displayName || username).slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <span>{streamer?.displayName || username}</span>
                <span className="inline-flex h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center text-[10px] font-bold border border-emerald-200">
                  ✓
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{username}</p>
            </div>

            {streamer?.bio && (
              <p className="text-xs text-slate-600 max-w-md leading-relaxed px-2">
                {streamer.bio}
              </p>
            )}

            {/* Social Links */}
            {streamer?.socialLinks && (
              <div className="flex items-center gap-1.5 pt-0.5">
                {streamer.socialLinks.youtube && (
                  <a
                    href={streamer.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="YouTube"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                  </a>
                )}
                {streamer.socialLinks.twitch && (
                  <a
                    href={streamer.socialLinks.twitch}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-500 hover:text-purple-600 transition-colors"
                    title="Twitch"
                  >
                    <TwitchIcon className="h-4 w-4" />
                  </a>
                )}
                {streamer.socialLinks.facebook && (
                  <a
                    href={streamer.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Facebook"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {/* Goal Card if active */}
            {goal && (
              <div className="w-full mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-left">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-900 flex items-center gap-1.5 truncate">
                    <span>🎯 {goal.title}</span>
                  </span>
                  <span className="text-emerald-600 font-bold tabular-nums ml-2">{goalPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 tabular-nums font-medium">
                  <span>สะสม {goal.currentAmount?.toLocaleString('th-TH')} ฿</span>
                  <span>เป้าหมาย {goal.targetAmount?.toLocaleString('th-TH')} ฿</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className={`flex items-center gap-1.5 font-semibold ${step === 'form' ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'form' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              1
            </span>
            <span>กรอกข้อมูล</span>
          </div>

          <div className="h-px w-8 bg-slate-200" />

          <div className={`flex items-center gap-1.5 font-semibold ${step === 'pay' ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'pay' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              2
            </span>
            <span>ชำระเงิน</span>
          </div>

          <div className="h-px w-8 bg-slate-200" />

          <div className={`flex items-center gap-1.5 font-semibold ${step === 'success' ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              3
            </span>
            <span>สำเร็จ</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Donation Form */}
        {step === 'form' && (
          <form
            onSubmit={handleSubmitForm}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-5"
          >
            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                จำนวนเงินที่ต้องการสนับสนุน (บาท)
              </label>

              {/* Amount Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                  ฿
                </div>
                <input
                  type="number"
                  min={streamer?.minAmount || 5}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`ขั้นต่ำ ${streamer?.minAmount || 5}`}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-10 pr-12 py-3 text-xl text-slate-900 font-bold tabular-nums placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  บาท
                </span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {presetAmounts.map((p: number) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors tabular-nums ${
                      Number(amount) === p
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    {p} ฿
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Name */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">ชื่อของคุณ</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 h-3.5 w-3.5 bg-white border-slate-300"
                  />
                  <span>ไม่ระบุตัวตน (Anonymous)</span>
                </label>
              </div>

              {!isAnonymous && (
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="ชื่อหรือฉายาที่จะแสดงบนหน้าจอ..."
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors"
                  required={!isAnonymous}
                />
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">ข้อความถึงสตรีมเมอร์</label>
                <span className="text-[11px] text-slate-400">{message.length}/200</span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="พิมพ์ข้อความส่งกำลังใจ หรือขอเพลง..."
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed shadow-2xs transition-colors"
              />
              {/* Quick Emojis */}
              <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                {['❤️', '🎉', '🔥', '👏', '🎮', '⭐', '💰', '🚀', '🐱', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMessage((prev) => (prev + emoji).slice(0, 200))}
                    className="h-7 w-7 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs flex items-center justify-center transition-colors shadow-2xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* TTS Option */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  {enableTTS ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">เปิดอ่านออกเสียงบนสตรีม (TTS)</span>
                  <span className="text-[11px] text-slate-500">ระบบสังเคราะห์เสียงอ่านชื่อและข้อความทันที</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableTTS}
                onChange={(e) => setEnableTTS(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 h-4 w-4 bg-white border-slate-300"
              />
            </label>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">เลือกช่องทางการชำระเงิน</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* PromptPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'promptpay'
                      ? 'border-sky-400 bg-sky-50 text-sky-900 shadow-2xs font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">พร้อมเพย์ QR</span>
                    <span className="text-[10px] text-slate-500">สแกนจ่ายทันที</span>
                  </div>
                </button>

                {/* Auto Slip Scan */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('slip')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'slip'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 shadow-2xs font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <ScanLine className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">สแกนสลิปออโต้</span>
                    <span className="text-[10px] text-emerald-600 font-medium">แนบสลิปผ่าน</span>
                  </div>
                </button>

                {/* TrueMoney */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('truemoney')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'truemoney'
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-2xs font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">TrueMoney</span>
                    <span className="text-[10px] text-slate-500">ซองของขวัญ</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Slip Upload Dropzone */}
            {paymentMethod === 'slip' && (
              <div className="space-y-2 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-emerald-600" /> อัปโหลดภาพสลิปโอนเงินธนาคาร
                  </span>
                  <span className="text-[10px] text-slate-500">รองรับสลิปทุกธนาคารในไทย</span>
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
                    className="cursor-pointer border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-5 text-center space-y-1.5 bg-white hover:bg-emerald-50/30 transition-colors shadow-2xs"
                  >
                    <UploadCloud className="h-6 w-6 text-emerald-600 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</p>
                      <p className="text-[11px] text-slate-500">ระบบจะตรวจสอบ QR Code บนสลิปและขึ้นแจ้งเตือนทันที</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-white p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img src={slipPreviewUrl} alt="Slip Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-200" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">{slipFile?.name}</p>
                        <p className="text-[11px] text-emerald-600 font-medium">พร้อมสแกนยืนยัน</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="ลบไฟล์"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TrueMoney Section */}
            {paymentMethod === 'truemoney' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
                {streamer?.truemoneyPhone ? (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-amber-900 font-semibold">โอนเงินผ่าน TrueMoney Wallet</p>
                    <p className="text-amber-700 font-bold font-mono text-base">{streamer.truemoneyPhone}</p>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch('/api/payment/truemoney', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: streamer.truemoneyPhone, amount: Number(amount) }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setTruemoneyQR(data.qrDataUrl);
                          setTruemoneyUrl(data.url);
                        }
                      }}
                      className="text-xs text-amber-700 underline hover:text-amber-900 font-semibold"
                    >
                      📱 สร้าง QR Code จำนวน {Number(amount).toLocaleString('th-TH')} บาท
                    </button>
                    {truemoneyQR && (
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <img src={truemoneyQR} alt="TrueMoney QR" className="w-36 h-36 bg-white rounded-lg p-1 border border-amber-200" />
                        <a href={truemoneyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 underline font-semibold">
                          เปิดลิงก์ TrueMoney →
                        </a>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">หลังโอนเงินแล้ว กรุณาอัปโหลดสลิปในช่องสลิปเพื่อยืนยัน</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-amber-900 block mb-1">วางลิงก์ซองของขวัญ TrueMoney:</label>
                    <input
                      type="url"
                      value={voucherUrl}
                      onChange={(e) => setVoucherUrl(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      className="w-full rounded-lg bg-white border border-amber-200 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || isScanningSlip}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              <span>
                {isScanningSlip
                  ? 'กำลังสแกน QR Code บนสลิป...'
                  : isProcessing
                  ? 'กำลังประมวลผล...'
                  : `ดำเนินการสนับสนุน ${Number(amount || 0).toLocaleString('th-TH')} บาท`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Payment (PromptPay QR) */}
        {step === 'pay' && currentDonation && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center space-y-5 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-1">
                <QrCode className="h-3.5 w-3.5" />
                <span>PromptPay Dynamic QR</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tabular-nums">
                {currentDonation.amount.toLocaleString('th-TH')} ฿
              </h2>
              <p className="text-xs text-slate-500">
                บัญชีผู้รับ: <strong className="text-slate-800">{streamer?.promptpayName || streamer?.displayName || 'สตรีมเมอร์'}</strong>
              </p>
            </div>

            {/* Authentic Thai QR Card */}
            <div className="mx-auto w-64 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1 border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-bold text-slate-800 tracking-wider">THAI QR PAYMENT</span>
                <span className="text-[10px] font-bold text-blue-600 font-mono">PromptPay</span>
              </div>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="PromptPay QR Code" className="h-52 w-52 object-contain bg-white rounded-lg p-1 border border-slate-200" />
              ) : (
                <div className="h-52 w-52 flex items-center justify-center text-slate-400 text-xs">
                  กำลังสร้าง QR...
                </div>
              )}
              <span className="text-[10px] text-slate-500 mt-2 font-medium">สแกนจ่ายได้ทุกแอปธนาคารไทย</span>
            </div>

            {/* Notice & Back button */}
            <div className="space-y-3 pt-1">
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 font-medium">
                ระบบจะตรวจสอบรายการและส่งแจ้งเตือนขึ้นหน้าจอสตรีมเมอร์ทันทีหลังการชำระเงิน
              </p>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>กลับไปแก้ไขข้อมูล</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && currentDonation && (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-sm animate-alert-pop">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">ส่งการสนับสนุนเรียบร้อยแล้ว</h2>
              <p className="text-xs text-emerald-700 font-medium">
                {currentDonation.paymentMethod === 'slip'
                  ? 'ตรวจสอบสลิปสำเร็จ และส่งข้อความขึ้นจอ OBS เรียบร้อยแล้ว'
                  : 'ข้อความและเสียงแจ้งเตือนถูกส่งขึ้นหน้าจอ OBS เรียบร้อยแล้ว'}
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto shadow-2xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้สนับสนุน:</span>
                <span className="font-semibold text-slate-900">{currentDonation.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ยอดเงิน:</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {currentDonation.amount.toLocaleString('th-TH')} บาท
                </span>
              </div>
              {currentDonation.message && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">ข้อความ:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{currentDonation.message}"
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs"
            >
              สนับสนุนอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
