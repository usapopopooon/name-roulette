import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('should render label', () => {
    render(
      <Checkbox label="テストラベル" checked={false} onChange={() => {}} />
    )

    expect(screen.getByText('テストラベル')).toBeInTheDocument()
  })

  it('should be checked when checked prop is true', () => {
    render(<Checkbox label="テスト" checked={true} onChange={() => {}} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should not be checked when checked prop is false', () => {
    render(<Checkbox label="テスト" checked={false} onChange={() => {}} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should call onChange with true when clicking unchecked', () => {
    const onChange = vi.fn()
    render(<Checkbox label="テスト" checked={false} onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should call onChange with false when clicking checked', () => {
    const onChange = vi.fn()
    render(<Checkbox label="テスト" checked={true} onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('should show checkmark icon when checked', () => {
    const { container } = render(
      <Checkbox label="テスト" checked={true} onChange={() => {}} />
    )

    const svg = container.querySelector('svg.lucide-check')
    expect(svg).toBeInTheDocument()
  })

  it('should not show checkmark icon when unchecked', () => {
    const { container } = render(
      <Checkbox label="テスト" checked={false} onChange={() => {}} />
    )

    const svg = container.querySelector('svg.lucide-check')
    expect(svg).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <Checkbox label="テスト" checked={false} onChange={() => {}} disabled />
    )

    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('should be clickable via label', () => {
    const onChange = vi.fn()
    render(
      <Checkbox label="クリック可能" checked={false} onChange={onChange} />
    )

    fireEvent.click(screen.getByText('クリック可能'))

    expect(onChange).toHaveBeenCalled()
  })
})
