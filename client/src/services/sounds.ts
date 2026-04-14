const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    gain.gain.setValueAtTime(vol, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + duration)
  } catch {
    // ignore audio errors silently
  }
}

export const SoundFX = {
  correct: () => {
    playTone(523, 'sine', 0.1)
    setTimeout(() => playTone(659, 'sine', 0.15), 100)
  },
  wrong: () => {
    playTone(200, 'square', 0.15, 0.08)
  },
  streak: () => {
    ;[400, 500, 600, 800, 1000].forEach((f, i) =>
      setTimeout(() => playTone(f, 'sine', 0.15), i * 80)
    )
  },
  levelUp: () => {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 'sine', 0.2), i * 100)
    )
  },
  continueBonus: () => {
    playTone(880, 'sine', 0.2, 0.12)
  },
}
