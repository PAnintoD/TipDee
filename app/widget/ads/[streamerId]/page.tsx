'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AdsWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    // In production, fetch streamer's ads
    const sampleAds = [
      {
        id: '1',
        title: 'Sponsor Banner',
        imageUrl: '',
        slot: 'bottom_right',
      },
    ];
    setAds(sampleAds.filter((a) => a.imageUrl));
  }, [streamerId]);

  if (ads.length === 0) {
    return <div className="min-h-screen w-full bg-transparent" />;
  }

  const currentAd = ads[currentAdIndex % ads.length];

  return (
    <div className="min-h-screen w-full flex items-end justify-end p-6 select-none overflow-hidden bg-transparent">
      {currentAd?.imageUrl && (
        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl animate-fade-in">
          <img src={currentAd.imageUrl} alt={currentAd.title} className="max-h-32 object-contain" />
        </div>
      )}
    </div>
  );
}
