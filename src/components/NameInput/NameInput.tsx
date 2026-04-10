import { ChangeEvent, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ActionButton } from '../ActionButton'

export interface NameInputProps {
  value: string
  onChange: (value: string) => void
  onShuffle?: () => void
  onBlur?: () => void
  disabled?: boolean
  count: number
  withHonorific?: boolean
}

const textareaFont = "'Segoe UI', 'Hiragino Sans', sans-serif" as const

export function NameInput({
  value,
  onChange,
  onShuffle,
  onBlur,
  disabled = false,
  count,
  withHonorific = false,
}: NameInputProps) {
  const textareaId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleScroll = () => {
    if (textareaRef.current) {
      setScrollTop(textareaRef.current.scrollTop)
    }
  }

  const lines = value.split('\n')

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center justify-between">
        <label htmlFor={textareaId} className="text-base text-white/80">
          参加者（改行区切り）
        </label>
        {onShuffle && (
          <ActionButton
            type="button"
            variant="accent"
            size="sm"
            onClick={onShuffle}
            disabled={disabled || count < 2}
          >
            🔀 シャッフル
          </ActionButton>
        )}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={textareaId}
          className={cn(
            'w-full h-[480px] p-4 text-base leading-relaxed',
            'border-2 border-white/30 rounded-xl',
            'bg-white/5 text-white resize-none outline-none',
            'focus:border-purple-start',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
          style={{ fontFamily: textareaFont }}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={'名前を入力\n改行で区切る'}
        />
        {withHonorific && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none border-2 border-transparent rounded-xl"
            aria-hidden="true"
          >
            <div
              className="p-4 text-base leading-relaxed"
              style={{
                transform: `translateY(-${scrollTop}px)`,
                fontFamily: textareaFont,
              }}
            >
              {lines.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">
                  <span className="invisible">{line || '\u00A0'}</span>
                  {line.trim() && (
                    <span className="visible text-white/60"> さん</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <span className="text-white/60 text-sm">参加者: {count}名</span>
      </div>
    </div>
  )
}
