// Sound Synthesizer and Web Speech API pronunciation engine

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lingopip_sound_enabled', String(enabled));
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lingopip_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  }
  return soundEnabled;
}

export type SoundEffect = 'correct' | 'wrong' | 'coin' | 'flip' | 'equip' | 'fanfare' | 'click';

export function playSound(type: SoundEffect) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (type) {
      case 'correct': {
        // Bright two-tone chime (E5 -> B5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.setValueAtTime(987.77, now + 0.1); // B5

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.35);
        break;
      }
      case 'coin': {
        // Metallic retro coin ping (B5 -> E6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'equip': {
        // Joyful ascending arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const noteStart = now + idx * 0.06;
          gain.gain.setValueAtTime(0.2, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.25);
        });
        break;
      }
      case 'flip': {
        // Soft card flip whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'wrong': {
        // Subtle error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'fanfare': {
        // Victory fanfare (C, E, G, High C sustained)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const noteStart = now + idx * 0.09;
          const duration = idx === notes.length - 1 ? 0.6 : 0.2;
          gain.gain.setValueAtTime(0.22, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + duration);
        });
        break;
      }
    }
  } catch (err) {
    console.debug('Web Audio not allowed or error:', err);
  }
}

// Web Speech API for authentic English pronunciation
export function speakWord(text: string, rate = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 0.7 for slow dictation, 1.0 for normal

    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality natural English voice if available
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}
