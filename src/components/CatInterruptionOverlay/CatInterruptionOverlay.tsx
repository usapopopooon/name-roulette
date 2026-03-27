import { useEffect } from 'react'
import {
  playCatInterruptionSound,
  playDuckInterruptionSound,
} from '../../utils/sound'

export type InterruptionType = 'cat' | 'duck'

export interface CatInterruptionOverlayProps {
  /** 表示するかどうか */
  show: boolean
  /** 乱入の種類（猫 or アヒル） */
  type?: InterruptionType
  /** 閉じた後のコールバック */
  onComplete?: () => void
}

const interruptionConfig = {
  cat: {
    text: '🐾 猫が暴れ中... 🐾',
  },
  duck: {
    text: '🦆 アヒルが行進中... 🦆',
  },
}

const CAT_SCRATCH_PAWS = [
  { side: 'left', top: '38%', delay: '0s', rotate: '-16deg' },
  { side: 'left', top: '56%', delay: '0.18s', rotate: '-8deg' },
  { side: 'right', top: '36%', delay: '0.08s', rotate: '16deg' },
  { side: 'right', top: '54%', delay: '0.26s', rotate: '8deg' },
] as const

export function CatInterruptionOverlay({
  show,
  type = 'cat',
  onComplete,
}: CatInterruptionOverlayProps) {
  const config = interruptionConfig[type]

  useEffect(() => {
    if (show && onComplete) {
      // 2.5秒後に完了（歩き終わるまで）
      const timer = setTimeout(() => {
        onComplete()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  useEffect(() => {
    if (!show) return

    if (type === 'cat') {
      playCatInterruptionSound()
    } else {
      playDuckInterruptionSound()
    }
  }, [show, type])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none overflow-hidden ${
        type === 'cat' ? 'animate-screen-rattle' : ''
      }`}
    >
      {type === 'cat' ? (
        <>
          <div className="absolute left-1/2 top-1/4 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="inline-block text-white font-bold animate-bounce [text-shadow:0_4px_8px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.5)] font-['Comic_Sans_MS','Kosugi_Maru',cursive] whitespace-nowrap [font-size:clamp(1.5rem,8vw,3rem)]">
              {config.text}
            </div>
          </div>
          <div className="absolute inset-0">
            {CAT_SCRATCH_PAWS.map((paw, index) => (
              <div
                key={index}
                className={`absolute animate-cat-scratch-paw text-white/90 [text-shadow:0_6px_18px_rgba(0,0,0,0.4)] ${
                  paw.side === 'left' ? 'left-[22%]' : 'right-[22%]'
                }`}
                style={{
                  top: paw.top,
                  fontSize: 'clamp(4rem, 12vw, 7rem)',
                  rotate: paw.rotate,
                  animationDelay: paw.delay,
                }}
              >
                🐾
              </div>
            ))}
          </div>
          <div className="absolute left-[54%] top-[54%] -translate-x-1/2 -translate-y-1/2 animate-cat-chaos">
            <div className="[font-size:clamp(5rem,22vw,9rem)] drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
              🐱
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold animate-bounce [text-shadow:0_4px_8px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.5)] font-['Comic_Sans_MS','Kosugi_Maru',cursive] whitespace-nowrap [font-size:clamp(1.5rem,8vw,3rem)]">
            {config.text}
          </div>
          <div className="absolute top-[40%] -translate-y-1/2 animate-cat-walk">
            <div className="flex items-end gap-[0.5vw]">
              <div className="[font-size:clamp(4rem,20vw,8rem)] animate-cat-waddle">
                🦆
              </div>
              <div className="[font-size:clamp(2rem,10vw,4rem)] animate-cat-waddle [animation-delay:0.1s]">
                🦆
              </div>
              <div className="[font-size:clamp(2rem,10vw,4rem)] animate-cat-waddle [animation-delay:0.2s]">
                🦆
              </div>
              <div className="[font-size:clamp(2rem,10vw,4rem)] animate-cat-waddle [animation-delay:0.3s]">
                🦆
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
