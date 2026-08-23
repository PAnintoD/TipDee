// Sound effects engine supporting both Web Audio synthesis and audio URLs

export const SOUND_PRESETS = [
  { id: 'chime', name: '🔔 ชามสดใส (Bright Chime)', type: 'synth' },
  { id: 'levelup', name: '⭐ เลเวลอัป (Level Up Fanfare)', type: 'synth' },
  { id: 'coin', name: '💰 เหรียญทอง (Mario Coin)', type: 'synth' },
  { id: 'fanfare', name: '🎺 แตรชัยชนะ (Victory Fanfare)', type: 'synth' },
  { id: 'magic', name: '✨ เวทมนตร์ประกาย (Magic Sparkle)', type: 'synth' },
  { id: 'cash', name: '💵 แคชเชียร์ (Cash Register)', type: 'synth' },
  { id: 'retro_jump', name: '🕹️ 8-Bit Jump (เสียงกระโดด)', type: 'synth' },
  { id: 'super_star', name: '🌟 Super Star (พลังดาว)', type: 'synth' },
  { id: 'mythic_bell', name: '💎 มหาเศรษฐี (Mythic Diamond)', type: 'synth' },
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
    } else if (type === 'retro_jump') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      osc.connect(gainNode);
      osc.start(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.stop(now + 0.25);
    } else if (type === 'super_star') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        oscGain.gain.setValueAtTime(0.25 * (volume / 100), now + index * 0.06);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.4);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.45);
      });
    } else if (type === 'mythic_bell') {
      // Deep orchestral bell chord (Diamond Tier)
      const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        oscGain.gain.setValueAtTime(0.2 * (volume / 100), now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
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
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const preset = SOUND_PRESETS.find((p) => p.id === soundUrlOrType);

    if (preset?.type === 'synth' || ['chime', 'levelup', 'coin', 'fanfare', 'magic', 'cash', 'retro_jump', 'super_star', 'mythic_bell'].includes(soundUrlOrType)) {
      playSynthesizedSound(soundUrlOrType, volume);
      setTimeout(resolve, 600);
      return;
    }

    // Audio file URL
    const url = preset?.url || soundUrlOrType;
    if (!url || !url.startsWith('http')) {
      playSynthesizedSound('levelup', volume);
      setTimeout(resolve, 600);
      return;
    }

    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.play().catch(() => {
        playSynthesizedSound('levelup', volume);
      });
      audio.onended = () => resolve();
      audio.onerror = () => {
        playSynthesizedSound('levelup', volume);
        resolve();
      };
      setTimeout(resolve, 3000);
    } catch {
      playSynthesizedSound('levelup', volume);
      resolve();
    }
  });
}
