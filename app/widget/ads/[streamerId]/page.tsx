'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AdsWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.adsSettings)) {
          const activeAds = data.data.adsSettings.filter((a: any) => a.active && a.imageUrl);
          setAds(activeAds);
        }
      })
      .catch((err) => console.error('Failed to load ads widget', err));
  }, [streamerId]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = (ads[currentAdIndex]?.intervalSeconds || 60) * 1000;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, interval);

    return () => clearInterval(timer);
  }, [ads, currentAdIndex]);

  if (ads.length === 0) {
    return <div className="min-h-screen w-full bg-transparent" />;
  }

  const currentAd = ads[currentAdIndex % ads.length];

  // Slot alignment
  let alignmentClass = 'items-end justify-end'; // bottom right
  if (currentAd?.slot?.includes('Left') || currentAd?.slot?.includes('ซ้าย')) {
    alignmentClass = currentAd?.slot?.includes('Top') || currentAd?.slot?.includes('บน') ? 'items-start justify-start' : 'items-end justify-start';
  } else if (currentAd?.slot?.includes('Top') || currentAd?.slot?.includes('บน')) {
    alignmentClass = 'items-start justify-end';
  }

  return (
    <div className={`min-h-screen w-full flex ${alignmentClass} p-6 select-none overflow-hidden bg-transparent`}>
      {currentAd?.imageUrl && (
        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl animate-fade-in bg-slate-900/60 backdrop-blur-xs p-2">
          <img src={currentAd.imageUrl} alt={currentAd.title} className="max-h-36 object-contain" />
        </div>
      )}
    </div>
  );
}
