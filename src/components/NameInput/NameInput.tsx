import { memo, useCallback, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

export interface NameInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  count: number
}

export const NameInput = memo(function NameInput({
  value,
  onChange,
  disabled = false,
  count,
}: NameInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleShuffle = useCallback(() => {
    const lines = value.split('\n').filter((line) => line.trim() !== '')
    // Fisher-Yates shuffle
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[lines[i], lines[j]] = [lines[j], lines[i]]
    }
    onChange(lines.join('\n'))
  }, [value, onChange])

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center justify-between">
        <label className="text-base text-gray-400">
          参加者（改行区切り）
        </label>
        <button
          type="button"
          onClick={handleShuffle}
          disabled={disabled || count < 2}
          className={cn(
            'px-3 py-1 text-xs font-semibold',
            'border-2 border-gray-600 rounded-full cursor-pointer',
            'bg-white/10 text-gray-400',
            'transition-all duration-300 ease-in-out',
            'hover:enabled:bg-white/15 hover:enabled:border-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          🔀 シャッフル
        </button>
      </div>
      <textarea
        className={cn(
          'w-full h-[480px] p-4 text-base leading-relaxed',
          'border-2 border-gray-700 rounded-xl',
          'bg-white/5 text-white resize-none outline-none',
          'focus:border-purple-start',
          'disabled:opacity-60 disabled:cursor-not-allowed'
        )}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={'名前を入力\n改行で区切る'}
      />
      <div className="mt-2 flex justify-end">
        <span className="text-gray-500 text-sm">参加者: {count}名</span>
      </div>
    </div>
  )
})
