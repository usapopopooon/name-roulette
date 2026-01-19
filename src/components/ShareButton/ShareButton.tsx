import { memo, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ShareButtonProps {
  onCopy: () => Promise<boolean>
}

export const ShareButton = memo(function ShareButton({
  onCopy,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(async () => {
    const success = await onCopy()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [onCopy])

  return (
    <div className="mt-5 p-4 bg-white/[0.03] rounded-xl border border-gray-700">
      <button
        className={cn(
          'w-full py-3 px-5 text-base font-semibold',
          'border-none rounded-lg cursor-pointer text-white',
          'transition-all duration-300 ease-in-out',
          copied
            ? 'bg-gradient-to-br from-emerald-500 to-green-400 shadow-[0_4px_15px_rgba(56,239,125,0.3)]'
            : 'bg-gradient-to-br from-purple-start to-purple-end shadow-[0_4px_15px_rgba(102,126,234,0.3)]',
          'hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]'
        )}
        onClick={handleClick}
      >
        {copied ? '✓ コピーしました！' : '🔗 共有リンクをコピー'}
      </button>
      <p className="mt-2.5 mb-0 text-sm text-gray-500 text-center">
        URLで参加者リストを共有できます
      </p>
    </div>
  )
})
