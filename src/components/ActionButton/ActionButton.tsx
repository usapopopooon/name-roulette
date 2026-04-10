import { ButtonHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'font-bold border-none rounded-full cursor-pointer transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-b from-gold to-gold-dark text-[#3e2013]',
          'shadow-[0_5px_20px_rgba(255,215,0,0.3)]',
          'hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_7px_25px_rgba(255,215,0,0.4)]',
        ],
        secondary: [
          'bg-white/10 text-white/80 border-2 border-white/30',
          'hover:enabled:bg-white/15 hover:enabled:border-white/50',
        ],
        accent: [
          'bg-gold/10 text-gold border-2 border-gold/30',
          'hover:enabled:bg-gold/20 hover:enabled:border-gold/50',
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
