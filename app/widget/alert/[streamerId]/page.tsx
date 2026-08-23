'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { playAlertSound } from '@/lib/soundEffects';
import { speakText } from '@/lib/ttsEngine';
import { filterProfanity } from '@/lib/badWords';
import { Sparkles, Crown, Gem, Zap } from 'lucide-react';

interface AlertItem {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  enableTTS: boolean;
}

type AlertTier = 'bronze' | 'silver' | 'gold' | 'diamond';

function getAlertTier(amount: number): AlertTier {
  if (amount >= 1000) return 'diamond';
  if (amount >= 300) return 'gold';
  if (amount >= 50) return 'silver';
  return 'bronze';
}

export default function AlertBoxWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [streamer, setStreamer] = useState<any>(null);
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [tier, setTier] = useState<AlertTier>('bronze');
  const [audioUnlocked, setAudioUnlocked] = useState(true);

  // Queue of alerts waiting to be played
  const queueRef = useRef<AlertItem[]>([]);
  const isProcessingRef = useRef(false);

  // Fetch streamer settings
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

  // Trigger special Tier Confetti Effect
  const fireTierConfetti = (alertTier: AlertTier) => {
    try {
      if (alertTier === 'diamond') {
        // Massive Rainbow Confetti
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#a855f7', '#ec4899', '#facc15', '#22c55e'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 80,
            origin: { x: 0, y: 0.7 },
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 80,
            origin: { x: 1, y: 0.7 },
          });
        }, 400);
      } else if (alertTier === 'gold') {
        // Gold Sparks
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#eab308', '#fef08a', '#ca8a04', '#ffffff'],
        });
      }
    } catch {}
  };

  // Process Alert Queue
  const processQueue = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const alert = queueRef.current.shift()!;
    const alertTier = getAlertTier(alert.amount);
    setTier(alertTier);
    setCurrentAlert(alert);
    setIsShowing(true);

    const settings = streamer?.alertSettings || {
      soundUrl: 'levelup',
      soundVolume: 80,
      duration: 7,
      ttsEnabled: true,
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 90,
      minAmountForTTS: 5,
    };

    // 1. Trigger Confetti for Gold/Diamond
    fireTierConfetti(alertTier);

    // 2. Play Sound Effect (Tier-special sound override or custom sound)
    const soundType = alertTier === 'diamond' ? 'mythic_bell' : settings.soundUrl || 'levelup';
    try {
      await playAlertSound(soundType, settings.soundVolume || 80);
    } catch (err) {
      console.warn('Audio playback error', err);
    }

    // 3. Speak TTS if enabled
    if (settings.ttsEnabled && alert.enableTTS && alert.amount >= (settings.minAmountForTTS || 0)) {
      const { cleanText: cleanMsg } = filterProfanity(alert.message || '');
      const speechText = `${alert.donorName} โดเนท ${alert.amount} บาท ${cleanMsg ? `ข้อความ: ${cleanMsg}` : ''}`;
      try {
        await speakText(speechText, {
          speed: settings.ttsSpeed || 1.0,
          pitch: settings.ttsPitch || 1.0,
          volume: settings.ttsVolume || 90,
        });
      } catch (e) {
        console.warn('TTS error', e);
      }
    }

    // 4. Wait for duration
    const displayDuration = Math.max(4000, (settings.duration || 7) * 1000);
    setTimeout(() => {
      setIsShowing(false);
      setTimeout(() => {
        setCurrentAlert(null);
        isProcessingRef.current = false;
        // Process next item in queue
        processQueue();
      }, 500);
    }, displayDuration);
  };

  // SSE Real-time connection
  useEffect(() => {
    const eventSource = new EventSource(`/api/realtime/${streamerId}`);

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'skip_alert') {
          // Cancel speech and hide immediately
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setIsShowing(false);
          setCurrentAlert(null);
          isProcessingRef.current = false;
          setTimeout(() => processQueue(), 200);
          return;
        }

        if (payload.type === 'donation' || payload.type === 'test_alert') {
          const d = payload.donation;
          if (d) {
            queueRef.current.push({
              id: d.id,
              donorName: d.donorName,
              amount: d.amount,
              message: d.message,
              enableTTS: d.enableTTS !== false,
            });
            processQueue();
          }
        }
      } catch (err) {
        console.error('SSE Error', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [streamerId, streamer]);

  const settings = streamer?.alertSettings || {
    imageUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z1anE4d2dmaHk4NXVycG43dnEycW10M2d4YWR0NmsyMzB5enFqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif',
    textColor: '#ffffff',
    highlightColor: '#22c55e',
    template: '{name} โดเนท {amount} บาท: {message}',
  };

  // Tier specific styles
  const tierStyles = {
    bronze: 'border-emerald-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)] bg-slate-950/80',
    silver: 'border-cyan-400/40 shadow-[0_0_40px_rgba(56,189,248,0.4)] bg-slate-950/85',
    gold: 'border-amber-400/60 shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-slate-950/90 ring-2 ring-amber-400/40',
    diamond: 'border-purple-400/80 shadow-[0_0_60px_rgba(168,85,247,0.7)] bg-slate-950/95 ring-4 ring-pink-500/50 animate-pulse',
  };

  const cleanMessage = currentAlert ? filterProfanity(currentAlert.message).cleanText : '';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Pop-up Alert Box */}
      {isShowing && currentAlert && (
        <div className={`relative z-10 flex flex-col items-center text-center space-y-3 animate-alert-pop max-w-lg w-full p-5 rounded-3xl border backdrop-blur-md ${tierStyles[tier]}`}>
          {/* Tier Badge */}
          {tier === 'diamond' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow-lg animate-bounce">
              <Gem className="h-3.5 w-3.5" /> DIAMOND DONATION 💎
            </div>
          )}
          {tier === 'gold' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-lg">
              <Crown className="h-3.5 w-3.5" /> GOLD DONATION 👑
            </div>
          )}
          {tier === 'silver' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30">
              <Sparkles className="h-3.5 w-3.5" /> SUPER DONATION ✨
            </div>
          )}

          {/* Animated Image / GIF */}
          {settings.imageUrl && (
            <div className="relative">
              <img
                src={settings.imageUrl}
                alt="Donation Animation"
                className="h-36 w-36 sm:h-44 sm:w-44 object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              />
            </div>
          )}

          {/* Text Title */}
          <div className="space-y-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <h1
              className="text-2xl sm:text-3xl font-black tracking-wide"
              style={{ color: settings.textColor || '#ffffff' }}
            >
              <span
                style={{ color: tier === 'diamond' ? '#ec4899' : tier === 'gold' ? '#facc15' : settings.highlightColor || '#22c55e' }}
                className="text-glow"
              >
                {currentAlert.donorName}
              </span>{' '}
              โดเนท{' '}
              <span
                style={{ color: tier === 'diamond' ? '#38bdf8' : tier === 'gold' ? '#facc15' : settings.highlightColor || '#22c55e' }}
                className="text-glow"
              >
                {currentAlert.amount.toLocaleString('th-TH')} บาท
              </span>
            </h1>

            {/* Donor Message (Profanity Filtered) */}
            {cleanMessage && (
              <div className="mt-2">
                <p className="inline-block text-sm sm:text-base font-semibold text-slate-100 bg-black/75 px-5 py-2.5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md max-w-md">
                  "{cleanMessage}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
