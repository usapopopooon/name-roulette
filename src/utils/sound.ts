// Web Audio APIを使ったサウンドユーティリティ

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

const createGainEnvelope = (
  gainNode: GainNode,
  startTime: number,
  peak: number,
  duration: number
) => {
  gainNode.gain.cancelScheduledValues(startTime)
  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(peak, startTime + 0.003)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
}

// ルーレットのカチカチ音（木の時計っぽい短いクリック音）
export const playClickSound = (): void => {
  try {
    const ctx = getAudioContext()
    const clickOscillator = ctx.createOscillator()
    const bodyOscillator = ctx.createOscillator()
    const clickGain = ctx.createGain()
    const bodyGain = ctx.createGain()
    const clickMixer = ctx.createGain()
    const startTime = ctx.currentTime
    const duration = 0.035

    clickOscillator.connect(clickGain)
    bodyOscillator.connect(bodyGain)
    clickGain.connect(clickMixer)
    bodyGain.connect(clickMixer)
    clickMixer.connect(ctx.destination)

    clickOscillator.type = 'triangle'
    clickOscillator.frequency.setValueAtTime(1400, startTime)
    clickOscillator.frequency.exponentialRampToValueAtTime(
      720,
      startTime + duration
    )

    bodyOscillator.type = 'sine'
    bodyOscillator.frequency.setValueAtTime(320, startTime)
    bodyOscillator.frequency.exponentialRampToValueAtTime(
      220,
      startTime + duration
    )

    createGainEnvelope(clickGain, startTime, 0.035, duration)
    createGainEnvelope(bodyGain, startTime, 0.018, duration)

    clickMixer.gain.setValueAtTime(0.75, startTime)

    clickOscillator.start(startTime)
    bodyOscillator.start(startTime)
    clickOscillator.stop(startTime + duration)
    bodyOscillator.stop(startTime + duration)
  } catch {
    // Audio not supported
  }
}

// 当選時のファンファーレ
export const playFanfare = (): void => {
  try {
    const ctx = getAudioContext()

    const masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    masterGain.gain.setValueAtTime(0.45, ctx.currentTime)

    // ファンファーレの音符（ドミソド）
    const notes = [
      { freq: 523.25, time: 0, duration: 0.18 }, // ド
      { freq: 659.25, time: 0.14, duration: 0.18 }, // ミ
      { freq: 783.99, time: 0.28, duration: 0.2 }, // ソ
      { freq: 1046.5, time: 0.44, duration: 0.55 }, // 高いド
    ]

    notes.forEach(({ freq, time, duration }) => {
      const mainOscillator = ctx.createOscillator()
      const overtoneOscillator = ctx.createOscillator()
      const mainGain = ctx.createGain()
      const overtoneGain = ctx.createGain()
      const noteStart = ctx.currentTime + time
      const noteEnd = noteStart + duration

      mainOscillator.connect(mainGain)
      overtoneOscillator.connect(overtoneGain)
      mainGain.connect(masterGain)
      overtoneGain.connect(masterGain)

      mainOscillator.type = 'triangle'
      mainOscillator.frequency.setValueAtTime(freq, noteStart)
      mainOscillator.frequency.exponentialRampToValueAtTime(
        freq * 0.995,
        noteEnd
      )

      overtoneOscillator.type = 'sine'
      overtoneOscillator.frequency.setValueAtTime(freq * 1.5, noteStart)
      overtoneOscillator.frequency.exponentialRampToValueAtTime(
        freq * 1.48,
        noteEnd
      )

      mainGain.gain.setValueAtTime(0.0001, noteStart)
      mainGain.gain.linearRampToValueAtTime(0.08, noteStart + 0.025)
      mainGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)

      overtoneGain.gain.setValueAtTime(0.0001, noteStart)
      overtoneGain.gain.linearRampToValueAtTime(0.018, noteStart + 0.02)
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)

      mainOscillator.start(noteStart)
      overtoneOscillator.start(noteStart)
      mainOscillator.stop(noteEnd)
      overtoneOscillator.stop(noteEnd)
    })
  } catch {
    // Audio not supported
  }
}
