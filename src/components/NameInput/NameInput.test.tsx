import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NameInput } from './NameInput'

describe('NameInput', () => {
  it('should render label', () => {
    render(<NameInput value="" onChange={() => {}} count={0} />)

    expect(screen.getByText('参加者（改行区切り）')).toBeInTheDocument()
  })

  it('should associate label with textarea', () => {
    render(<NameInput value="" onChange={() => {}} count={0} />)

    expect(screen.getByLabelText('参加者（改行区切り）')).toBe(
      screen.getByRole('textbox')
    )
  })

  it('should render textarea with value', () => {
    render(<NameInput value={'田中\n佐藤'} onChange={() => {}} count={2} />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('田中\n佐藤')
  })

  it('should render count', () => {
    render(<NameInput value="田中\n佐藤" onChange={() => {}} count={2} />)

    expect(screen.getByText('参加者: 2名')).toBeInTheDocument()
  })

  it('should call onChange when typing', () => {
    const onChange = vi.fn()
    render(<NameInput value="" onChange={onChange} count={0} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '新しい名前' } })

    expect(onChange).toHaveBeenCalledWith('新しい名前')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<NameInput value="" onChange={() => {}} count={0} disabled />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('should show placeholder when empty', () => {
    render(<NameInput value="" onChange={() => {}} count={0} />)

    const textarea = screen.getByPlaceholderText(/名前を入力/)
    expect(textarea).toBeInTheDocument()
  })

  it('should render shuffle button when onShuffle is provided', () => {
    render(
      <NameInput
        value="田中\n佐藤"
        onChange={() => {}}
        onShuffle={() => {}}
        count={2}
      />
    )

    expect(screen.getByText('🔀 シャッフル')).toBeInTheDocument()
  })

  it('should not render shuffle button when onShuffle is not provided', () => {
    render(<NameInput value="田中\n佐藤" onChange={() => {}} count={2} />)

    expect(screen.queryByText('🔀 シャッフル')).not.toBeInTheDocument()
  })

  it('should call onShuffle when shuffle button is clicked', () => {
    const onShuffle = vi.fn()
    render(
      <NameInput
        value="田中\n佐藤"
        onChange={() => {}}
        onShuffle={onShuffle}
        count={2}
      />
    )

    fireEvent.click(screen.getByText('🔀 シャッフル'))

    expect(onShuffle).toHaveBeenCalledOnce()
  })

  it('should disable shuffle button when count is less than 2', () => {
    render(
      <NameInput
        value="田中"
        onChange={() => {}}
        onShuffle={() => {}}
        count={1}
      />
    )

    expect(screen.getByText('🔀 シャッフル')).toBeDisabled()
  })

  it('should disable shuffle button when disabled', () => {
    render(
      <NameInput
        value="田中\n佐藤"
        onChange={() => {}}
        onShuffle={() => {}}
        count={2}
        disabled
      />
    )

    expect(screen.getByText('🔀 シャッフル')).toBeDisabled()
  })
})
