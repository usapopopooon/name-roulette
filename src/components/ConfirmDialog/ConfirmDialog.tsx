import { memo } from 'react'

export interface ConfirmDialogProps {
  message: string
  onYes: () => void
  onNo: () => void
}

export const ConfirmDialog = memo(function ConfirmDialog({
  message,
  onYes,
  onNo,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onNo}
    >
      <div
        className="text-center p-8 rounded-2xl bg-gradient-to-br from-dark-secondary/90 to-dark-tertiary/90 border-2 border-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xl text-white mb-6 whitespace-pre-line">
          {message}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onYes}
            className="px-8 py-3 text-lg font-semibold rounded-full bg-gold/20 text-gold border-2 border-gold/50 hover:bg-gold/30 transition-all duration-300 cursor-pointer"
          >
            はい
          </button>
          <button
            onClick={onNo}
            className="px-8 py-3 text-lg font-semibold rounded-full bg-gray-500/20 text-gray-300 border-2 border-gray-500/50 hover:bg-gray-500/30 transition-all duration-300 cursor-pointer"
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  )
})
