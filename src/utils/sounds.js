// Notification tones, synthesized with the Web Audio API — no audio files, so
// nothing to download and nothing to break offline.
//
// Browsers refuse to start audio until the user has interacted with the page,
// which is exactly the state a freshly-opened counter tablet is in. unlockAudio()
// resumes the context on the first interaction; without it the first alert of
// the shift is silently dropped.

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
};

let unlockBound = false;

export const unlockAudio = () => {
  if (unlockBound) return;
  unlockBound = true;
  const resume = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
    window.addEventListener(evt, resume, { once: false, passive: true })
  );
};

/**
 * Tone presets. Each is a list of {freq, start, dur} notes plus a waveform.
 * Kept declarative so adding a tone is data, not code.
 */
export const TONES = {
  chime: {
    label: 'Chime',
    type: 'sine',
    notes: [
      { freq: 523.25, start: 0, dur: 0.2 },
      { freq: 659.25, start: 0.15, dur: 0.25 },
    ],
  },
  doorbell: {
    label: 'Doorbell',
    type: 'triangle',
    notes: [
      { freq: 784, start: 0, dur: 0.25 },
      { freq: 659.25, start: 0.2, dur: 0.25 },
      { freq: 784, start: 0.4, dur: 0.3 },
    ],
  },
  bell: {
    label: 'Bell',
    type: 'sine',
    notes: [
      { freq: 880, start: 0, dur: 0.35 },
      { freq: 1174.66, start: 0.05, dur: 0.4 },
    ],
  },
  marimba: {
    label: 'Marimba',
    type: 'sine',
    notes: [
      { freq: 587.33, start: 0, dur: 0.16 },
      { freq: 698.46, start: 0.12, dur: 0.16 },
      { freq: 880, start: 0.24, dur: 0.28 },
    ],
  },
  alert: {
    label: 'Alert',
    type: 'square',
    notes: [
      { freq: 987.77, start: 0, dur: 0.12 },
      { freq: 987.77, start: 0.18, dur: 0.12 },
      { freq: 987.77, start: 0.36, dur: 0.16 },
    ],
  },
  beep: {
    label: 'Classic Beep',
    type: 'sine',
    notes: [
      { freq: 1046.5, start: 0, dur: 0.1 },
      { freq: 1046.5, start: 0.16, dur: 0.14 },
    ],
  },
};

export const TONE_OPTIONS = Object.entries(TONES).map(([value, t]) => ({
  value,
  label: t.label,
}));

const DEFAULT_VOLUME = 70;

/**
 * Play one tone preset.
 * `volume` is 0-100 as stored in settings; 0 plays nothing.
 */
export const playTone = (toneKey = 'chime', volume = DEFAULT_VOLUME) => {
  const tone = TONES[toneKey] || TONES.chime;
  const level = Math.max(0, Math.min(100, Number(volume) || 0)) / 100;
  if (level === 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    tone.notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = tone.type;
      osc.frequency.value = freq;

      const t = now + start;
      // 0.4 is the ceiling at volume 100 — loud enough across a counter,
      // short of clipping on tablet speakers.
      gain.gain.setValueAtTime(0.4 * level, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  } catch {
    // Audio unavailable (no device, blocked, unsupported) — never break the UI.
  }
};

const toneLength = (toneKey) => {
  const tone = TONES[toneKey] || TONES.chime;
  return tone.notes.reduce((max, n) => Math.max(max, n.start + n.dur), 0);
};

/**
 * Repeat a tone until stopped. Used for staff calls when the restaurant has
 * "ring until acknowledged" switched on. Returns { stop }.
 */
export const startRinging = (toneKey = 'doorbell', volume = DEFAULT_VOLUME, gapMs = 2000) => {
  let stopped = false;
  playTone(toneKey, volume);
  const interval = setInterval(() => {
    if (!stopped) playTone(toneKey, volume);
  }, Math.max(gapMs, toneLength(toneKey) * 1000 + 300));

  return {
    stop: () => {
      stopped = true;
      clearInterval(interval);
    },
  };
};

// Backwards-compatible helpers. Existing callers pass no settings and get the
// previous defaults, so nothing goes silent before the settings are wired in.
export const playNewOrderSound = (settings) =>
  playTone(settings?.newOrderTone || 'chime', settings?.soundEnabled === false ? 0 : settings?.soundVolume ?? DEFAULT_VOLUME);

export const playStaffCallSound = (settings) =>
  playTone(settings?.staffCallTone || 'doorbell', settings?.soundEnabled === false ? 0 : settings?.soundVolume ?? DEFAULT_VOLUME);
