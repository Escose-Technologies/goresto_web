let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

export const playNewOrderSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two-tone notification: ascending beep
    const frequencies = [523.25, 659.25]; // C5, E5

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const start = now + i * 0.15;
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  } catch (err) {
    // Audio not available — silent fail
    console.warn('Could not play notification sound:', err.message);
  }
};

export const playStaffCallSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Three-tone doorbell: distinct from order sound
    const frequencies = [784, 659.25, 784]; // G5, E5, G5

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      const start = now + i * 0.2;
      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);

      oscillator.start(start);
      oscillator.stop(start + 0.25);
    });
  } catch (err) {
    console.warn('Could not play staff call sound:', err.message);
  }
};

// Continuous ringing for staff call popup — plays repeating ring pattern
// Returns { stop } to silence the ring
export const startStaffCallRing = () => {
  let intervalId = null;
  let stopped = false;

  const playRingCycle = () => {
    if (stopped) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Ring pattern: two-tone bell, repeated
      const tones = [
        { freq: 880, start: 0, dur: 0.15 },     // A5
        { freq: 698.46, start: 0.18, dur: 0.15 }, // F5
        { freq: 880, start: 0.4, dur: 0.15 },     // A5
        { freq: 698.46, start: 0.58, dur: 0.15 }, // F5
      ];

      tones.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + start;
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
        osc.start(t);
        osc.stop(t + dur);
      });
    } catch (err) {
      // silent fail
    }
  };

  // Play immediately, then repeat every 2 seconds
  playRingCycle();
  intervalId = setInterval(playRingCycle, 2000);

  return {
    stop: () => {
      stopped = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};
