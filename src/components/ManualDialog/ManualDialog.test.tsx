import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ManualDialog } from './ManualDialog'

describe('ManualDialog', () => {
  it('should render the dialog with title', () => {
    render(<ManualDialog onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('使い方')).toBeInTheDocument()
  })

  it('should render all section titles', () => {
    render(<ManualDialog onClose={() => {}} />)

    expect(screen.getByText('基本の使い方')).toBeInTheDocument()
    expect(screen.getByText('ドラッグ回転')).toBeInTheDocument()
    expect(screen.getByText('「さん」付けオプション')).toBeInTheDocument()
    expect(screen.getByText('右クリックメニュー')).toBeInTheDocument()
    expect(screen.getByText('「待った！」機能')).toBeInTheDocument()
    expect(screen.getByText('前回当選者の除外')).toBeInTheDocument()
    expect(screen.getByText('当選者のシフト')).toBeInTheDocument()
    expect(screen.getByText('URL共有')).toBeInTheDocument()
    expect(screen.getByText('動物乱入')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<ManualDialog onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('閉じる'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ManualDialog onClose={onClose} />)

    const backdrop = container.firstChild as HTMLElement
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should not call onClose when dialog content is clicked', () => {
    const onClose = vi.fn()
    render(<ManualDialog onClose={onClose} />)

    fireEvent.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<ManualDialog onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should have aria-modal attribute', () => {
    render(<ManualDialog onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
