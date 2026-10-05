/**
 * Siri Thai Text-to-Speech Engine for TipDee
 * Exclusively plays natural Thai streamer Siri voice via Google Translate TTS
 * No robotic or foreign fallback voices
 */
import { normalizeTextForTTS } from './badWords';

export interface TTSOptions {
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  volume?: number; // 0 - 100
}

let activeAudio: HTMLAudioElement | null = null;

/**
 * Stops any currently playing TTS audio immediately
 */
export function stopTTS(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch {}
    activeAudio = null;
  }
}

/**
 * Speaks text using the iconic streamer "Siri Thai" voice exclusively
 */
export async function speakText(rawText: string, options: TTSOptions = {}): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const text = normalizeTextForTTS(rawText);
  if (!text || text.trim() === '') {
    return;
  }

  // Stop any previous speech
  stopTTS();

  return new Promise<void>((resolve) => {
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text.slice(0, 250))}`;
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      const volumePercent = options.volume !== undefined ? options.volume : 90;
      audio.volume = Math.max(0, Math.min(1, volumePercent / 100));

      if (options.speed && options.speed !== 1.0) {
        audio.playbackRate = Math.max(0.6, Math.min(1.8, options.speed));
      }

      let isFinished = false;
      const cleanup = () => {
        if (!isFinished) {
          isFinished = true;
          if (activeAudio === audio) {
            activeAudio = null;
          }
          resolve();
        }
      };

      audio.onended = cleanup;
      audio.onerror = (e) => {
        console.warn('[Siri TTS] Audio playback error:', e);
        cleanup();
      };

      // Safety timeout based on text length
      const maxDuration = Math.max(4000, text.length * 200);
      const timer = setTimeout(cleanup, maxDuration);

      audio.play().catch((err) => {
        console.warn('[Siri TTS] Audio play prevented by browser policy:', err);
        clearTimeout(timer);
        cleanup();
      });
    } catch (err) {
      console.warn('[Siri TTS] Failed to create audio element:', err);
      resolve();
    }
  });
}
