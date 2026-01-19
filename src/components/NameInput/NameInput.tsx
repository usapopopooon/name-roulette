import { memo, ChangeEvent } from 'react'
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

  return (
    <div className="w-full">
      <label className="block mb-2.5 text-base text-gray-400">
        参加者（改行区切り）
      </label>
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
      <div className="mt-2.5 flex justify-end">
        <span className="text-gray-500 text-sm">参加者: {count}名</span>
      </div>
    </div>
  )
})
