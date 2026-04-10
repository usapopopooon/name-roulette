import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface ShareButtonProps {
  onCopy: () => Promise<boolean>
}

export function ShareButton({ onCopy }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const success = await onCopy()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-5 p-4 bg-white/[0.03] rounded-xl border border-white/30">
      <button
        className={cn(
          'w-full py-3 px-5 text-base font-semibold',
          'border-none rounded-lg cursor-pointer text-white',
          'transition-all duration-300 ease-in-out',
          copied
            ? 'bg-gradient-to-b from-gold to-gold-dark text-[#2a1508] shadow-[0_4px_15px_rgba(255,215,0,0.3)]'
            : 'bg-white/10 border-2 border-white/30 shadow-[0_4px_15px_rgba(255,255,255,0.05)]',
          !copied &&
            'hover:-translate-y-0.5 hover:bg-white/15 hover:border-white/50'
        )}
        onClick={handleClick}
      >
        {copied ? '✓ コピーしました！' : '🔗 共有リンクをコピー'}
      </button>
      <p className="mt-2.5 mb-0 text-sm text-white/60 text-center">
        URLで参加者リストを共有できます
      </p>
    </div>
  )
}
