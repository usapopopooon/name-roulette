import { useEffect, useState } from 'react'
import { Confetti } from './Confetti'
import { Fireworks } from './Fireworks'
import { ContextMenu } from '../ContextMenu'
import { playFanfare } from '../../utils/sound'

export interface ResultDisplayProps {
  result: string | null
  /** 候補者リスト（前後移動用） */
  candidates?: string[]
  onClose?: () => void
  onChallenge?: () => void
  /** 前後の候補者に移動（direction: -1 = 前, 1 = 次） */
  onShift?: (direction: -1 | 1) => void
}

export function ResultDisplay({
  result,
  candidates = [],
  onClose,
  onChallenge,
  onShift,
}: ResultDisplayProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)

  // 結果が表示されたらファンファーレを鳴らす
  useEffect(() => {
    if (result) {
      playFanfare()
    }
  }, [result])

  // resultが変わったらコンテキストメニューを閉じる
  useEffect(() => {
    setContextMenu(null)
  }, [result])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  if (!result) return null

  // 現在の結果のインデックス
  const currentIndex = candidates.indexOf(result)
  const canShift = candidates.length >= 2 && currentIndex !== -1

  // 次の候補者名（ループ）
  const nextIndex = canShift ? (currentIndex + 1) % candidates.length : -1
  const nextCandidate = canShift ? candidates[nextIndex] : null

  return (
    <>
      <Fireworks />
      <Confetti />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="text-center p-10 rounded-3xl bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/90 border-2 border-gold/30 shadow-[0_0_60px_rgba(255,215,0,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-2xl text-gold mb-4">🎉 当選者 🎉</div>
          <div
            className="text-[clamp(2rem,8vw,4rem)] font-bold text-white [text-shadow:0_0_40px_rgba(255,215,0,0.8)] animate-pulse-slow select-none mb-6"
            onContextMenu={handleContextMenu}
          >
            {result}
          </div>
          <div className="flex flex-col gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-8 py-3 text-lg font-semibold rounded-full bg-gold/20 text-gold border-2 border-gold/50 hover:bg-gold/30 transition-all duration-300 cursor-pointer"
              >
                閉じる
              </button>
            )}
            {onChallenge && (
              <button
                onClick={onChallenge}
                className="px-8 py-3 text-lg font-semibold rounded-full bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:bg-red-500/30 transition-all duration-300 cursor-pointer"
              >
                🙅 待った！
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 右クリックメニュー */}
      {contextMenu && onShift && canShift && nextCandidate && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: `次の人にする → ${nextCandidate}`,
              onClick: () => onShift(1),
            },
          ]}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  )
}
