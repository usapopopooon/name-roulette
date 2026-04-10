import { useEffect, useRef } from 'react'

export interface ConfirmDialogProps {
  message: string
  onYes: () => void
  onNo: () => void
}

export function ConfirmDialog({ message, onYes, onNo }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onNo()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onNo])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onNo}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="確認ダイアログ"
        tabIndex={-1}
        className="text-center p-8 rounded-2xl bg-[#2a1508]/95 border-2 border-gold/40 shadow-[0_0_40px_rgba(255,215,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xl text-white mb-6 whitespace-pre-line">
          {message}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onYes}
            className="px-8 py-3 text-lg font-semibold rounded-full bg-gold/20 text-gold border-2 border-gold/50 hover:bg-gold/30 transition-all duration-300 cursor-pointer"
          >
            はい
          </button>
          <button
            type="button"
            onClick={onNo}
            className="px-8 py-3 text-lg font-semibold rounded-full bg-white/10 text-white/80 border-2 border-white/30 hover:bg-white/15 transition-all duration-300 cursor-pointer"
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  )
}
