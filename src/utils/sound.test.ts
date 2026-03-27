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
    frequency: {
      value: number
      setValueAtTime: ReturnType<typeof vi.fn>
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
    }
    type: string
  }
  let mockGainNode: {
    connect: ReturnType<typeof vi.fn>
    gain: {
      cancelScheduledValues: ReturnType<typeof vi.fn>
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
      frequency: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      type: '',
    }

    mockGainNode = {
      connect: vi.fn(),
      gain: {
        cancelScheduledValues: vi.fn(),
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

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3)
    })

    it('should shape the click with pitch envelopes', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled()
      expect(
        mockOscillator.frequency.exponentialRampToValueAtTime
      ).toHaveBeenCalled()
    })

    it('should use layered oscillator types', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(['triangle', 'sine']).toContain(mockOscillator.type)
    })

    it('should start and stop oscillators', async () => {
      const { playClickSound } = await import('./sound')
      playClickSound()

      expect(mockOscillator.start).toHaveBeenCalledTimes(2)
      expect(mockOscillator.stop).toHaveBeenCalledTimes(2)
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playClickSound } = await import('./sound')

      expect(() => playClickSound()).not.toThrow()
    })
  })

  describe('playFanfare', () => {
    it('should create oscillators and gain nodes for the fanfare', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should use layered wave types for fanfare', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      expect(['triangle', 'sine']).toContain(mockOscillator.type)
    })

    it('should configure gain nodes for the fanfare', async () => {
      const { playFanfare } = await import('./sound')
      playFanfare()

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalled()
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playFanfare } = await import('./sound')

      expect(() => playFanfare()).not.toThrow()
    })
  })

  describe('playCatInterruptionSound', () => {
    it('should create oscillators and gain nodes for the cat sound', async () => {
      const { playCatInterruptionSound } = await import('./sound')
      playCatInterruptionSound()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playCatInterruptionSound } = await import('./sound')

      expect(() => playCatInterruptionSound()).not.toThrow()
    })
  })

  describe('playDuckInterruptionSound', () => {
    it('should create oscillator and gain node for the duck sound', async () => {
      const { playDuckInterruptionSound } = await import('./sound')
      playDuckInterruptionSound()

      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
    })

    it('should not throw when AudioContext is not supported', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { playDuckInterruptionSound } = await import('./sound')

      expect(() => playDuckInterruptionSound()).not.toThrow()
    })
  })
})
