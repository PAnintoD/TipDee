'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';

function QRWidgetInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const template = searchParams.get('template') || 'banner';
  const sizeParam = searchParams.get('size') || 'md';

  const [streamer, setStreamer] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // 100% transparent background enforcement for OBS Studio
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('widget-route');
      document.body.classList.add('widget-route');
      document.documentElement.style.setProperty('background', 'transparent', 'important');
      document.documentElement.style.setProperty('background-color', 'transparent', 'important');
      document.body.style.setProperty('background', 'transparent', 'important');
      document.body.style.setProperty('background-color', 'transparent', 'important');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('widget-route');
        document.body.classList.remove('widget-route');
      }
    };
  }, []);

  // Fetch streamer info
  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStreamer(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, [streamerId]);

  // Generate QR Code with center badge
  useEffect(() => {
    const generate = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tip-dee.vercel.app';
        const donationUrl = `${baseUrl}/u/${streamerId}`;

        const canvas = document.createElement('canvas');
        const size = 600;
        canvas.width = size;
        canvas.height = size;

        await QRCode.toCanvas(canvas, donationUrl, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });

        // Add TipDee center badge
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const badgeSize = size * 0.22;
          const badgeX = (size - badgeSize) / 2;
          const badgeY = (size - badgeSize) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, badgeSize / 2 + 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = streamer?.avatarUrl || '/tipdee-badge.svg';
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, badgeSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize);
              ctx.restore();
              resolve();
            };
            img.onerror = () => resolve();
          });
        }

        setQrDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error(err);
      }
    };

    generate();
  }, [streamerId, streamer]);

  // Dimensions based on sizeParam
  const sizeStyles = {
    sm: { wrapper: 'max-w-[280px]', qr: 'h-40 w-40' },
    md: { wrapper: 'max-w-[340px]', qr: 'h-48 w-48' },
    lg: { wrapper: 'max-w-[420px]', qr: 'h-64 w-64' },
  }[sizeParam as 'sm' | 'md' | 'lg'] || { wrapper: 'max-w-[340px]', qr: 'h-48 w-48' };

  return (
    <div className="widget-overlay w-full h-full min-h-screen flex items-center justify-center p-3 select-none overflow-hidden !bg-transparent">
      {template === 'minimal' ? (
        <div className="flex flex-col items-center space-y-2 animate-alert-pop">
          <div className="p-3.5 rounded-2xl bg-white shadow-2xl border border-black/10">
            {qrDataUrl && <img src={qrDataUrl} alt="Donation QR" className={sizeStyles.qr} />}
          </div>
          <span
            className="text-xs font-black text-white stream-text-stroke-sm tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 2px #000000' }}
          >
            {streamer?.displayName || streamerId}
          </span>
        </div>
      ) : (
        /* Stream Overlay Banner */
        <div
          className={`w-full ${sizeStyles.wrapper} rounded-2xl bg-[#0f141d]/90 border border-white/15 backdrop-blur-md p-4 sm:p-5 shadow-2xl flex flex-col items-center text-center space-y-3 animate-alert-pop`}
        >
          {/* Header */}
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
                สแกนเพื่อโดเนท
              </span>
            </div>
          </div>

          {/* QR Container */}
          <div className="p-3 rounded-xl bg-white shadow-inner flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Donation QR" className={`${sizeStyles.qr} object-contain`} />
            ) : (
              <div className={`${sizeStyles.qr} flex items-center justify-center text-xs text-slate-400`}>
                กำลังโหลด...
              </div>
            )}
          </div>

          {/* PromptPay Footer Badge */}
          <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-white/[0.08] text-[11px] font-semibold text-slate-300">
            <img src="/promptpay-badge.svg" alt="PromptPay" className="h-4 w-4 object-contain" />
            <span>พร้อมเพย์ • สแกนสลิปออโต้ • เสียงสิริ</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QRWidgetPage() {
  return (
    <Suspense fallback={null}>
      <QRWidgetInner />
    </Suspense>
  );
}
