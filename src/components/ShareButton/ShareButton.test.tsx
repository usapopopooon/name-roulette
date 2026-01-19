import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton } from './ShareButton'

describe('ShareButton', () => {
  it('should render share button', () => {
    render(<ShareButton onCopy={async () => true} />)

    expect(screen.getByRole('button')).toHaveTextContent(
      '🔗 共有リンクをコピー'
    )
  })

  it('should render hint text', () => {
    render(<ShareButton onCopy={async () => true} />)

    expect(
      screen.getByText('URLで参加者リストを共有できます')
    ).toBeInTheDocument()
  })

  it('should call onCopy when clicked', async () => {
    const onCopy = vi.fn().mockResolvedValue(true)
    render(<ShareButton onCopy={onCopy} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledTimes(1)
    })
  })

  it('should show success message after successful copy', async () => {
    const onCopy = vi.fn().mockResolvedValue(true)
    render(<ShareButton onCopy={onCopy} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('✓ コピーしました！')).toBeInTheDocument()
    })
  })

  it('should not show success message after failed copy', async () => {
    const onCopy = vi.fn().mockResolvedValue(false)
    render(<ShareButton onCopy={onCopy} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.queryByText('✓ コピーしました！')).not.toBeInTheDocument()
    })
  })
})
