'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { playAlertSound } from '@/lib/soundEffects';
import { speakText } from '@/lib/ttsEngine';

interface AlertItem {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  enableTTS: boolean;
}

export default function AlertBoxWidgetPage() {
  const params = useParams();
  const streamerId = (params?.streamerId as string) || 'streamerza';

  const [streamer, setStreamer] = useState<any>(null);
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const [isShowing, setIsShowing] = useState(false);
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

  // Process Alert Queue
  const processQueue = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const alert = queueRef.current.shift()!;
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

    // 1. Play sound effect
    try {
      await playAlertSound(settings.soundUrl || 'levelup', settings.soundVolume || 80);
    } catch (err) {
      console.warn('Audio play failed', err);
    }

    // 2. Speak TTS if enabled
    if (settings.ttsEnabled && alert.enableTTS && alert.amount >= (settings.minAmountForTTS || 0)) {
      const speechText = `${alert.donorName} โดเนท ${alert.amount} บาท ${alert.message ? `ข้อความ: ${alert.message}` : ''}`;
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

    // 3. Wait for duration
    const displayDuration = Math.max(4000, (settings.duration || 7) * 1000);
    setTimeout(() => {
      setIsShowing(false);
      setTimeout(() => {
        setCurrentAlert(null);
        isProcessingRef.current = false;
        // Process next item
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
        if (payload.type === 'donation' || payload.type === 'test_alert') {
          const d = payload.donation;
          if (d) {
            queueRef.current.push({
              id: d.id,
              donorName: d.donorName,
              amount: d.amount,
              message: d.message,
              enableTTS: d.enableTTS,
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
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 select-none overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Audio unlock helper button if needed in browser preview */}
      {!audioUnlocked && (
        <button
          onClick={() => {
            setAudioUnlocked(true);
            playAlertSound('levelup', 10);
          }}
          className="fixed top-2 left-2 z-50 px-3 py-1 bg-brand-500 text-white rounded text-xs"
        >
          เปิดเสียงในเบราว์เซอร์
        </button>
      )}

      {/* Pop-up Alert Box */}
      {isShowing && currentAlert && (
        <div className="relative z-10 flex flex-col items-center text-center space-y-3 animate-alert-pop max-w-lg w-full">
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
                style={{ color: settings.highlightColor || '#22c55e' }}
                className="text-glow"
              >
                {currentAlert.donorName}
              </span>{' '}
              โดเนท{' '}
              <span
                style={{ color: settings.highlightColor || '#22c55e' }}
                className="text-glow"
              >
                {currentAlert.amount.toLocaleString('th-TH')} บาท
              </span>
            </h1>

            {/* Donor Message */}
            {currentAlert.message && (
              <div className="mt-2">
                <p className="inline-block text-sm sm:text-base font-semibold text-slate-100 bg-black/75 px-5 py-2 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md max-w-md">
                  "{currentAlert.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
