import { memo, ButtonHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'px-8 py-3 text-lg font-bold border-none rounded-full cursor-pointer transition-all duration-300 ease-in-out',
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
      },
      isDisabled: {
        true: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const ActionButton = memo(function ActionButton({
  variant = 'primary',
  disabled,
  children,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, isDisabled: !!disabled }),
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})
