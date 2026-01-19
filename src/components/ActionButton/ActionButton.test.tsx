import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('should render children', () => {
    render(<ActionButton>クリック</ActionButton>)

    expect(screen.getByRole('button')).toHaveTextContent('クリック')
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ActionButton onClick={onClick}>クリック</ActionButton>)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <ActionButton onClick={onClick} disabled>
        クリック
      </ActionButton>
    )

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should apply primary variant by default', () => {
    const { container } = render(<ActionButton>Primary</ActionButton>)

    const button = container.querySelector('button')
    expect(button?.className).toContain('from-orange-start')
  })

  it('should apply secondary variant styles', () => {
    const { container } = render(
      <ActionButton variant="secondary">Secondary</ActionButton>
    )

    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-white/10')
  })

  it('should apply disabled class when disabled', () => {
    const { container } = render(<ActionButton disabled>Disabled</ActionButton>)

    const button = container.querySelector('button')
    expect(button?.className).toContain('opacity-50')
    expect(button?.className).toContain('cursor-not-allowed')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ActionButton disabled>Disabled</ActionButton>)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
