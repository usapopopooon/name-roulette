import { memo } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const Checkbox = memo(function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 cursor-pointer select-none',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(
          'h-[22px] w-[22px] shrink-0 rounded-md border-2 border-purple-start',
          'bg-purple-start/10 flex items-center justify-center cursor-pointer',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-start focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-purple-start data-[state=checked]:border-purple-start'
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <Check className="h-3.5 w-3.5 font-bold" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="text-gray-400 text-[0.95rem]">{label}</span>
    </label>
  )
})
