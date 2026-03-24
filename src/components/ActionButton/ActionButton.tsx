import { ButtonHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'font-bold border-none rounded-full cursor-pointer transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-br from-orange-start to-orange-end text-white',
          'shadow-[0_5px_20px_rgba(245,175,25,0.4)]',
          'hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_7px_25px_rgba(245,175,25,0.5)]',
        ],
        secondary: [
          'bg-white/10 text-gray-400 border-2 border-gray-600',
          'hover:enabled:bg-white/15 hover:enabled:border-gray-500',
        ],
        accent: [
          'bg-emerald-900/50 text-emerald-200 border-2 border-emerald-800',
          'hover:enabled:bg-emerald-800/50 hover:enabled:border-emerald-700',
        ],
      },
      size: {
        default: 'px-8 py-3 text-lg',
        sm: 'px-3 py-1 text-xs',
      },
      isDisabled: {
        true: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'default' | 'sm'
}

export function ActionButton({
  variant = 'primary',
  size = 'default',
  disabled,
  children,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, isDisabled: !!disabled }),
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
