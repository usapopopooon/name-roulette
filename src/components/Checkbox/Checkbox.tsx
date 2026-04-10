import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({
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
        onCheckedChange={(value) => onChange(value === true)}
        disabled={disabled}
        className={cn(
          'h-[22px] w-[22px] shrink-0 rounded-md border-2 border-gold/50',
          'bg-gold/10 flex items-center justify-center cursor-pointer',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a1508]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-gold data-[state=checked]:border-gold'
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[#3e2013]">
          <Check className="h-3.5 w-3.5 font-bold" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="text-white/80 text-[0.95rem]">{label}</span>
    </label>
  )
}
