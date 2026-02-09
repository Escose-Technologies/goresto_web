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
