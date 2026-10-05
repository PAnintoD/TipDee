'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Printer,
  Sliders,
  Tv,
  Eye,
  Layers,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

const COLOR_PRESETS = [
  { id: 'black', label: 'ดำคลาสสิก', dark: '#000000', light: '#ffffff' },
  { id: 'emerald', label: 'เขียวมรกต TipDee', dark: '#16a34a', light: '#ffffff' },
  { id: 'cyan', label: 'ฟ้าสดใส สตรีมเมอร์', dark: '#0284c7', light: '#ffffff' },
  { id: 'pink', label: 'ชมพูนีออน', dark: '#db2777', light: '#ffffff' },
  { id: 'gold', label: 'ทองสว่าง VIP', dark: '#ca8a04', light: '#ffffff' },
  { id: 'transparent-black', label: 'ดำ (พื้นโปร่งใส)', dark: '#000000', light: '#00000000' },
  { id: 'transparent-white', label: 'ขาว (พื้นโปร่งใส)', dark: '#ffffff', light: '#00000000' },
  { id: 'transparent-cyan', label: 'ฟ้า (พื้นโปร่งใส)', dark: '#00e5ff', light: '#00000000' },
];

export default function QRCodeGeneratorPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';

  const [streamer, setStreamer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // QR Parameters
  const [presetAmount, setPresetAmount] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<'banner' | 'minimal' | 'standee'>('banner');
  const [qrDarkColor, setQrDarkColor] = useState('#000000');
  const [qrLightColor, setQrLightColor] = useState('#ffffff');
  const [centerBadge, setCenterBadge] = useState<'avatar' | 'promptpay' | 'tipdee' | 'none'>('tipdee');
  const [qrSizeResolution, setQrSizeResolution] = useState<number>(1024);
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'checker'>('dark');

  // Copy states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOBS, setCopiedOBS] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  // Generated QR Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch streamer info
  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStreamer(data.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [streamerId]);

  // Construct final donation URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tip-dee.vercel.app';
  const donationUrl = `${baseUrl}/u/${streamerId}${presetAmount ? `?amount=${presetAmount}` : ''}`;
  const obsWidgetUrl = `${baseUrl}/widget/qr/${streamerId}${selectedTemplate !== 'banner' ? `?template=${selectedTemplate}` : ''}`;

  // Generate QR Code with high-res Canvas + center badge
  useEffect(() => {
    let isCancelled = false;

    const generateQR = async () => {
      try {
        const canvas = document.createElement('canvas');
        const size = qrSizeResolution;
        canvas.width = size;
        canvas.height = size;

        // Render base QR code with highest error correction ('H' - 30%)
        await QRCode.toCanvas(canvas, donationUrl, {
          width: size,
          margin: 2,
          color: {
            dark: qrDarkColor,
            light: qrLightColor === 'transparent' ? '#00000000' : qrLightColor,
          },
          errorCorrectionLevel: 'H',
        });

        // Add center badge/logo if requested
        if (centerBadge !== 'none') {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            let logoSrc = '/tipdee-badge.svg';
            if (centerBadge === 'promptpay') logoSrc = '/promptpay-badge.svg';
            if (centerBadge === 'avatar' && streamer?.avatarUrl) logoSrc = streamer.avatarUrl;

            const badgeSize = size * 0.22;
            const badgeX = (size - badgeSize) / 2;
            const badgeY = (size - badgeSize) / 2;

            // Draw white circular backing for contrast
            ctx.save();
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, badgeSize / 2 + 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();

            // Load and draw image
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = logoSrc;
              img.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, badgeSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize);
                ctx.restore();
                resolve();
              };
              img.onerror = () => {
                // If avatar fails, fall back without badge
                resolve();
              };
            });
          }
        }

        if (!isCancelled) {
          const resultUrl = canvas.toDataURL('image/png');
          setQrDataUrl(resultUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };

    generateQR();

    return () => {
      isCancelled = true;
    };
  }, [donationUrl, qrDarkColor, qrLightColor, centerBadge, qrSizeResolution, streamer]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(donationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyOBS = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(obsWidgetUrl);
      setCopiedOBS(true);
      setTimeout(() => setCopiedOBS(false), 2000);
    }
  };

  // Download high-resolution PNG
  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;

    if (selectedTemplate === 'minimal') {
      const link = document.createElement('a');
      link.download = `tipdee-qr-${streamerId}.png`;
      link.href = qrDataUrl;
      link.click();
      return;
    }

    // Composite template into a single PNG image
    const compCanvas = document.createElement('canvas');
    const width = 1080;
    const height = selectedTemplate === 'standee' ? 1440 : 1080;
    compCanvas.width = width;
    compCanvas.height = height;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    if (selectedTemplate === 'standee') {
      // White clean card background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Top Header Gradient
      const grad = ctx.createLinearGradient(0, 0, width, 240);
      grad.addColorStop(0, '#047857');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 240);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('สแกนเพื่อโดเนทสนับสนุน', width / 2, 120);

      ctx.font = '32px Prompt, sans-serif';
      ctx.fillText(streamer?.displayName || streamerId, width / 2, 185);

      // PromptPay Badge Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px Prompt, sans-serif';
      ctx.fillText('พร้อมเพย์ (PromptPay) & ทรูมันนี่', width / 2, 330);

      // Draw QR Code
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        const qrDrawSize = 640;
        ctx.drawImage(qrImg, (width - qrDrawSize) / 2, 390, qrDrawSize, qrDrawSize);

        // Footer Instructions
        ctx.fillStyle = '#475569';
        ctx.font = '28px Prompt, sans-serif';
        ctx.fillText('เปิดกล้องมือถือ หรือแอปธนาคารเพื่อสแกน', width / 2, 1140);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 32px Prompt, sans-serif';
        ctx.fillText('แจ้งเตือนขึ้นจอ OBS ทันที พร้อมเสียงสิริ!', width / 2, 1200);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px Prompt, sans-serif';
        ctx.fillText(`tip-dee.vercel.app/u/${streamerId}`, width / 2, 1340);

        const link = document.createElement('a');
        link.download = `tipdee-standee-${streamerId}.png`;
        link.href = compCanvas.toDataURL('image/png');
        link.click();
      };
    } else {
      // Banner Template
      ctx.fillStyle = '#0f131a';
      ctx.fillRect(0, 0, width, height);

      // Card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Streamer Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('สแกนโดเนทขึ้นจอ OBS', width / 2, 130);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 36px Prompt, sans-serif';
      ctx.fillText(streamer?.displayName || streamerId, width / 2, 200);

      // Draw QR
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        const qrDrawSize = 600;
        ctx.drawImage(qrImg, (width - qrDrawSize) / 2, 260, qrDrawSize, qrDrawSize);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '28px Prompt, sans-serif';
        ctx.fillText('พร้อมเพย์ สแกนสลิปออโต้ & เสียงสิริภาษาไทย', width / 2, 940);

        const link = document.createElement('a');
        link.download = `tipdee-banner-${streamerId}.png`;
        link.href = compCanvas.toDataURL('image/png');
        link.click();
      };
    }
  };

  // Download SVG
  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(donationUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: qrDarkColor,
          light: qrLightColor === 'transparent' ? '#00000000' : qrLightColor,
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `tipdee-qr-${streamerId}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      if ((window as any).ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    } catch (e) {
      console.warn('Clipboard write image failed', e);
    }
  };

  // Print Standee
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <QrCode className="h-6 w-6 text-emerald-600" />
                <span>สร้าง QR Code โดเนท (Donation QR Code Studio)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                สร้างและปรับแต่ง QR Code สำหรับให้ผู้ชมสแกนเข้าหน้าโดเนททันที ใส่บนจอ OBS หรือดาวน์โหลดไปปริ้นท์ตั้งโต๊ะ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/u/${streamerId}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
              >
                <span>ดูหน้าโดเนทจริง</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Controls & Settings */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Donation Link Box */}
              <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>1. ลิงก์หน้าโดเนทเป้าหมาย (Destination URL)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">อัปเดตอัตโนมัติ</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={donationUrl}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex-shrink-0 shadow-xs"
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>

                {/* Preset Amount quick buttons */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                    กำหนดจำนวนเงินเริ่มต้นเมื่อสแกน (Optional Preset Amount):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { amt: '', label: 'ไม่ระบุ (ตามใจผู้โดเนท)' },
                      { amt: '20', label: '20฿' },
                      { amt: '50', label: '50฿' },
                      { amt: '100', label: '100฿' },
                      { amt: '300', label: '300฿' },
                      { amt: '500', label: '500฿' },
                      { amt: '1000', label: '1,000฿' },
                    ].map((item) => (
                      <button
                        key={item.amt}
                        type="button"
                        onClick={() => setPresetAmount(item.amt)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          presetAmount === item.amt
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Template Selection */}
              <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>2. เลือกรูปแบบเทมเพลต (Layout Template)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('banner')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      selectedTemplate === 'banner'
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">🖥️ ป้ายบนจอ OBS</span>
                        {selectedTemplate === 'banner' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        มีชื่อสตรีมเมอร์ รูปโปรไฟล์ และสัญลักษณ์สแกนโดเนท
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700">แนะนำสำหรับสตรีม</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('minimal')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      selectedTemplate === 'minimal'
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">📱 มินิมอล QR เพียวๆ</span>
                        {selectedTemplate === 'minimal' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        เฉพาะตัว QR Code คมชัดระดับเวกเตอร์ ไม่มีกรอบกวนใจ
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">คลีน เรียบง่าย</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('standee')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      selectedTemplate === 'standee'
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">🏷️ การ์ดสแตนดี้พิมพ์</span>
                        {selectedTemplate === 'standee' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        การ์ดแนวตั้งพิมพ์ลงกระดาษ A4/A6 สำหรับตั้งหน้าโต๊ะแคส
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-700">สำหรับพิมพ์ตั้งโต๊ะ</span>
                  </button>
                </div>
              </div>

              {/* 3. Colors & Center Badge */}
              <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-emerald-600" />
                  <span>3. ปรับแต่งสีและไอคอนตรงกลาง (Style & Badges)</span>
                </h3>

                {/* Color presets */}
                <div>
                  <span className="block text-xs text-slate-600 mb-2 font-medium">ชุดสียอดนิยม (Color Presets):</span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setQrDarkColor(preset.dark);
                          setQrLightColor(preset.light);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-2 transition-colors ${
                          qrDarkColor === preset.dark && qrLightColor === preset.light
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/20 shadow-2xs"
                          style={{ backgroundColor: preset.dark }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5 font-medium">สีเส้น QR (Dark Color):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrDarkColor}
                        onChange={(e) => setQrDarkColor(e.target.value)}
                        className="h-8 w-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={qrDarkColor}
                        onChange={(e) => setQrDarkColor(e.target.value)}
                        className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1.5 font-medium">สีพื้นหลัง (Background Color):</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQrLightColor('#ffffff')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                          qrLightColor === '#ffffff'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        สีขาว (ปกติ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrLightColor('#00000000')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                          qrLightColor === '#00000000' || qrLightColor === 'transparent'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        โปร่งใส 100%
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center Badge Selection */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs text-slate-600 mb-2 font-medium">ไอคอนตรงกลาง QR Code (Center Badge):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'tipdee', label: '🎀 โลโก้ TipDee', icon: '/tipdee-badge.svg' },
                      { id: 'promptpay', label: '💳 พร้อมเพย์', icon: '/promptpay-badge.svg' },
                      { id: 'avatar', label: '👤 รูปโปรไฟล์คุณ', icon: streamer?.avatarUrl || '/mascot.svg' },
                      { id: 'none', label: '🚫 ไม่ใส่โลโก้', icon: null },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCenterBadge(item.id as any)}
                        className={`p-2.5 rounded-lg border text-center transition-colors flex flex-col items-center gap-1.5 ${
                          centerBadge === item.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.icon ? (
                          <img src={item.icon} alt={item.label} className="h-7 w-7 rounded-full object-contain shadow-2xs" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                            -
                          </div>
                        )}
                        <span className="text-[11px] truncate w-full">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. OBS Browser Source Integration */}
              <div className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tv className="h-4 w-4 text-emerald-600" />
                    <span>4. ลิงก์สำหรับใส่ใน OBS Browser Source</span>
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ขนาดแนะนำ: 400 x 480 px</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={obsWidgetUrl}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyOBS}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex-shrink-0 shadow-xs"
                  >
                    {copiedOBS ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedOBS ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์ OBS'}</span>
                  </button>
                  <Link
                    href={`/widget/qr/${streamerId}${selectedTemplate !== 'banner' ? `?template=${selectedTemplate}` : ''}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors flex-shrink-0"
                    title="เปิดหน้าต่างแยก"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 เพิ่ม <strong>Browser Source</strong> ใน OBS แล้ววางลิงก์ด้านบน QR Code จะแสดงผลสดบนจอพร้อมพื้นหลังโปร่งใส 100%!
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Interactive Preview & Export */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20 rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" />
                    <span>ตัวอย่างแสดงผลสด (Live Preview)</span>
                  </h3>

                  {/* Preview Background Switcher */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('dark')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        previewBg === 'dark' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      จอดำ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('checker')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        previewBg === 'checker' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ตารางโปร่งใส
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        previewBg === 'light' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      พื้นขาว
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div
                  className={`w-full min-h-[420px] rounded-xl border border-slate-200 flex items-center justify-center p-6 relative overflow-hidden transition-colors shadow-inner ${
                    previewBg === 'dark'
                      ? 'bg-[#07090e]'
                      : previewBg === 'light'
                      ? 'bg-slate-50 text-slate-900'
                      : 'bg-slate-100'
                  }`}
                  style={
                    previewBg === 'checker'
                      ? {
                          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }
                      : undefined
                  }
                >
                  {/* TEMPLATE 1: Stream Overlay Banner */}
                  {selectedTemplate === 'banner' && (
                    <div className="w-full max-w-[340px] rounded-2xl bg-[#0f141d]/90 border border-white/10 backdrop-blur-md p-5 shadow-2xl flex flex-col items-center text-center space-y-3 animate-alert-pop">
                      {/* Top Header */}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={streamer?.avatarUrl || '/mascot.svg'}
                          alt="Avatar"
                          className="h-10 w-10 rounded-full border-2 border-emerald-400/50 object-cover shadow"
                        />
                        <div className="text-left">
                          <h4 className="text-sm font-black text-white leading-tight">
                            {streamer?.displayName || streamerId}
                          </h4>
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            สแกนโดเนทขึ้นจอ
                          </span>
                        </div>
                      </div>

                      {/* QR Display */}
                      <div className="p-3 rounded-xl bg-white shadow-inner flex items-center justify-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Donation QR Code"
                            className="h-48 w-48 object-contain"
                          />
                        ) : (
                          <div className="h-48 w-48 flex items-center justify-center text-xs text-slate-400">
                            กำลังสร้าง QR...
                          </div>
                        )}
                      </div>

                      {/* PromptPay & TrueMoney footer badge */}
                      <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-white/[0.08] text-[11px] font-semibold text-slate-300">
                        <img src="/promptpay-badge.svg" alt="PromptPay" className="h-4 w-4 object-contain" />
                        <span>พร้อมเพย์ • สแกนสลิปออโต้ • เสียงสิริ</span>
                      </div>
                    </div>
                  )}

                  {/* TEMPLATE 2: Minimal Pure QR */}
                  {selectedTemplate === 'minimal' && (
                    <div className="flex flex-col items-center space-y-2 animate-alert-pop">
                      <div className="p-4 rounded-2xl bg-white shadow-2xl border border-black/5 flex items-center justify-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Donation QR Code"
                            className="h-56 w-56 object-contain"
                          />
                        ) : (
                          <div className="h-56 w-56 flex items-center justify-center text-xs text-slate-400">
                            กำลังสร้าง QR...
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 tracking-wide">
                        {streamer?.displayName || streamerId}
                      </span>
                    </div>
                  )}

                  {/* TEMPLATE 3: Printable Table Standee */}
                  {selectedTemplate === 'standee' && (
                    <div className="w-full max-w-[320px] rounded-xl bg-white text-slate-900 border border-slate-200 shadow-2xl overflow-hidden flex flex-col items-center text-center animate-alert-pop">
                      {/* Standee Header */}
                      <div className="w-full bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white">
                        <span className="text-xs uppercase font-extrabold tracking-widest opacity-80">TIPDEE DONATE</span>
                        <h4 className="text-base font-black leading-tight mt-0.5">สแกนเพื่อโดเนท</h4>
                        <p className="text-xs font-medium text-emerald-100">{streamer?.displayName || streamerId}</p>
                      </div>

                      <div className="p-4 space-y-3 flex flex-col items-center">
                        <div className="p-2 border border-slate-200 rounded-lg shadow-sm">
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt="Donation QR Code"
                              className="h-44 w-44 object-contain"
                            />
                          ) : (
                            <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400">
                              กำลังสร้าง QR...
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 text-xs text-slate-600 font-medium">
                          <p className="font-bold text-slate-900">เปิดกล้องมือถือเพื่อสแกน</p>
                          <p className="text-[11px] text-emerald-600 font-semibold">แจ้งเตือนขึ้นจอทันที พร้อมเสียงอ่านสิริ!</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Export Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadPNG}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>ดาวน์โหลด PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSVG}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
                    >
                      <Download className="h-4 w-4 text-emerald-600" />
                      <span>ดาวน์โหลด SVG</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
                    >
                      {copiedImage ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedImage ? 'คัดลอกรูปแล้ว' : 'คัดลอกรูปภาพ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5 text-emerald-600" />
                      <span>สั่งพิมพ์ (Print)</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                  ✨ <strong>เคล็ดลับ:</strong> สามารถนำรูป QR Code นี้ไปใส่ในฉากพักเบรก (BRB), เริ่มสตรีม, หรือติดไว้ที่มุมจอ OBS เพื่อให้คนดูยกมือถือขึ้นมาสแกนจ่ายได้ง่ายที่สุด!
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
