import { memo, useEffect } from 'react'

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
    text: '🐾 猫が通過中... 🐾',
  },
  duck: {
    text: '🦆 アヒルが行進中... 🦆',
  },
}

export const CatInterruptionOverlay = memo(function CatInterruptionOverlay({
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

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* 通過中テキスト */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl text-white font-bold animate-bounce [text-shadow:0_4px_8px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.5)] font-['Comic_Sans_MS','Kosugi_Maru',cursive]">
        {config.text}
      </div>
      {/* 右から左へてくてく歩く */}
      <div className="absolute top-1/2 -translate-y-1/2 animate-cat-walk">
        {type === 'cat' ? (
          <div className="text-[8rem] animate-cat-waddle">🐈</div>
        ) : (
          <div className="flex items-end gap-2">
            {/* 親アヒル */}
            <div className="text-[8rem] animate-cat-waddle">🦆</div>
            {/* 子アヒル3匹 */}
            <div className="text-[4rem] animate-cat-waddle [animation-delay:0.1s]">
              🦆
            </div>
            <div className="text-[4rem] animate-cat-waddle [animation-delay:0.2s]">
              🦆
            </div>
            <div className="text-[4rem] animate-cat-waddle [animation-delay:0.3s]">
              🦆
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
