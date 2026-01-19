import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sound utilities', () => {
  let mockAudioContext: {
    createOscillator: ReturnType<typeof vi.fn>
    createGain: ReturnType<typeof vi.fn>
    destination: object
    currentTime: number
  }
  let mockOscillator: {
    connect: ReturnType<typeof vi.fn>
    start: ReturnType<typeof vi.fn>
    stop: ReturnType<typeof vi.fn>
    frequency: { value: number }
    type: string
  }
  let mockGainNode: {
    connect: ReturnType<typeof vi.fn>
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    vi.resetModules()

    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: '',
    }

    mockGainNode = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }

    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      currentTime: 0,
    }

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => mockAudioContext)
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('playClickSound', () => {
    it('should create oscillator and gain node', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should set oscillator frequency to 800Hz', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockOscillator.frequency.value).toBe(800)
    })

    it('should use square wave type', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockOscillator.type).toBe('square')
    })

    it('should start and stop oscillator', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockOscillator.start).toHaveBeenCalled()
      expect(mockOscillator.stop).toHaveBeenCalled()
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playClickSound } = await import('./sound')

      expect(() => playClickSound()).not.toThrow()
    })
  })

  describe('playFanfare', () => {
    it('should create multiple oscillators for the fanfare notes', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      // ドミソド = 4音
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(4)
    })

    it('should use sine wave type for fanfare', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      expect(mockOscillator.type).toBe('sine')
    })

    it('should start and stop all oscillators', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      expect(mockOscillator.start).toHaveBeenCalledTimes(4)
      expect(mockOscillator.stop).toHaveBeenCalledTimes(4)
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playFanfare } = await import('./sound')

      expect(() => playFanfare()).not.toThrow()
    })
  })
})
