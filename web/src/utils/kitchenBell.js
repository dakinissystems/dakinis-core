/** Campana corta al recibir comanda en cocina (Web Audio API, sin archivos externos). */
export function dakinisPlayKitchenBell() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    function tone(freqHz, startSec, durationSec, volume = 0.22) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freqHz;
      const t0 = ctx.currentTime + startSec;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + durationSec + 0.05);
    }

    tone(880, 0, 0.12);
    tone(1174.66, 0.14, 0.18);
    tone(1567.98, 0.32, 0.22, 0.18);

    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch {
    /* Navegador sin audio o política de autoplay */
  }
}
