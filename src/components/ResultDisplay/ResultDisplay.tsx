import { useEffect, useRef, useState } from 'react'
import { Confetti } from './Confetti'
import { Fireworks } from './Fireworks'
import { ContextMenu } from '../ContextMenu'
import { playFanfare } from '../../utils/sound'

export interface ResultCandidate {
  id: string
  label: string
}

export interface ResultDisplayProps {
  resultId: string | null
  resultLabel: string | null
  candidates?: ResultCandidate[]
  onClose?: () => void
  onChallenge?: () => void
  onShift?: (direction: -1 | 1) => void
}

export function ResultDisplay({
  resultId,
  resultLabel,
  candidates = [],
  onClose,
  onChallenge,
  onShift,
}: ResultDisplayProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resultLabel) {
      playFanfare()
      dialogRef.current?.focus()
    }
  }, [resultLabel])

  useEffect(() => {
    setContextMenu(null)
  }, [resultId])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  if (!resultId || !resultLabel) return null

  const currentIndex = candidates.findIndex(
    (candidate) => candidate.id === resultId
  )
  const canShift = candidates.length >= 2 && currentIndex !== -1
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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="抽選結果"
          tabIndex={-1}
          className="text-center p-10 rounded-3xl bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/90 border-2 border-gold/30 shadow-[0_0_60px_rgba(255,215,0,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-2xl text-gold mb-4">🎉 当選者 🎉</div>
          <div
            className="text-[clamp(2rem,8vw,4rem)] font-bold text-white [text-shadow:0_0_40px_rgba(255,215,0,0.8)] animate-pulse-slow select-none mb-6"
            onContextMenu={handleContextMenu}
          >
            {resultLabel}
          </div>
          <div className="flex flex-col gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-lg font-semibold rounded-full bg-gold/20 text-gold border-2 border-gold/50 hover:bg-gold/30 transition-all duration-300 cursor-pointer"
              >
                閉じる
              </button>
            )}
            {onChallenge && (
              <button
                type="button"
                onClick={onChallenge}
                className="px-8 py-3 text-lg font-semibold rounded-full bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:bg-red-500/30 transition-all duration-300 cursor-pointer"
              >
                🙅 待った！
              </button>
            )}
          </div>
        </div>
      </div>

      {contextMenu && onShift && canShift && nextCandidate && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: `次の人にする → ${nextCandidate.label}`,
              onClick: () => onShift(1),
            },
          ]}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  )
}
