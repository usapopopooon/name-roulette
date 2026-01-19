// Web Audio APIを使ったサウンドユーティリティ

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// ルーレットのカチカチ音（短いクリック音）
export const playClickSound = (): void => {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'square'

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  } catch {
    // Audio not supported
  }
}

// 当選時のファンファーレ
export const playFanfare = (): void => {
  try {
    const ctx = getAudioContext()

    // ファンファーレの音符（ドミソド）
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 }, // ド
      { freq: 659.25, time: 0.15, duration: 0.15 }, // ミ
      { freq: 783.99, time: 0.3, duration: 0.15 }, // ソ
      { freq: 1046.5, time: 0.45, duration: 0.4 }, // 高いド
    ]

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + time)
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + time + duration
      )

      oscillator.start(ctx.currentTime + time)
      oscillator.stop(ctx.currentTime + time + duration)
    })
  } catch {
    // Audio not supported
  }
}
