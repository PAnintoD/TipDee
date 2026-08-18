// Sound effects engine supporting both Web Audio synthesis and audio URLs

export const SOUND_PRESETS = [
  { id: 'chime', name: '🔔 ชามสดใส (Bright Chime)', type: 'synth' },
  { id: 'levelup', name: '⭐ เลเวลอัป (Level Up Fanfare)', type: 'synth' },
  { id: 'coin', name: '💰 เสียงเหรียญทอง (Mario Coin)', type: 'synth' },
  { id: 'fanfare', name: '🎺 แตรชัยชนะ (Victory Fanfare)', type: 'synth' },
  { id: 'magic', name: '✨ เวทมนตร์ประกาย (Magic Sparkle)', type: 'synth' },
  { id: 'cash', name: '💵 แคชเชียร์ (Cash Register)', type: 'synth' },
  { id: 'meme_wow', name: '😲 Anime Wow', url: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3' },
  { id: 'success_bell', name: '🎵 กระดิ่งใส (Success Bell)', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
];

export function playSynthesizedSound(type: string, volume: number = 80) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume / 100));
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'coin') {
      // 2-tone mario style coin
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.45);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    } else if (type === 'levelup') {
      // Arpeggio C, E, G, C
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.09);
        oscGain.gain.setValueAtTime(0.3 * (volume / 100), now + index * 0.09);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.3);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.35);
      });
    } else if (type === 'fanfare') {
      // Victory fanfare
      const notes = [440, 440, 440, 587.33, 523.25, 659.25, 880];
      const durations = [0.1, 0.1, 0.1, 0.25, 0.15, 0.15, 0.5];
      let offset = 0;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + offset);
        oscGain.gain.setValueAtTime(0.15 * (volume / 100), now + offset);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + offset + durations[idx]);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + durations[idx]);
        offset += durations[idx] + 0.03;
      });
    } else if (type === 'cash') {
      // Cash register ding
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.connect(gainNode);
      osc.start(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.stop(now + 0.6);
    } else {
      // Default Chime
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      osc.connect(gainNode);
      osc.start(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.stop(now + 0.5);
    }
  } catch (err) {
    console.error('Audio playback error', err);
  }
}

export function playAlertSound(soundUrlOrType: string, volume: number = 80): Promise<void> {
  return new Promise((resolve) => {
    if (!soundUrlOrType || soundUrlOrType === 'none') {
      resolve();
      return;
    }

    // Check if it's one of our built-in synthesized presets
    const synthTypes = ['chime', 'levelup', 'coin', 'fanfare', 'magic', 'cash'];
    if (synthTypes.includes(soundUrlOrType)) {
      playSynthesizedSound(soundUrlOrType, volume);
      setTimeout(resolve, 800);
      return;
    }

    // Audio file URL
    try {
      const audio = new Audio(soundUrlOrType);
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.onended = () => resolve();
      audio.onerror = () => {
        // Fallback to synth chime on URL failure
        playSynthesizedSound('levelup', volume);
        setTimeout(resolve, 800);
      };
      audio.play().catch(() => {
        playSynthesizedSound('levelup', volume);
        setTimeout(resolve, 800);
      });
    } catch (e) {
      playSynthesizedSound('levelup', volume);
      setTimeout(resolve, 800);
    }
  });
}
