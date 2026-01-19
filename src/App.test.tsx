import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('renders the title', () => {
    render(<App />)
    expect(screen.getByText('🎯 お名前ルーレット')).toBeInTheDocument()
  })

  it('renders the start button', () => {
    render(<App />)
    expect(screen.getByText('スタート！')).toBeInTheDocument()
  })

  it('renders the reset button', () => {
    render(<App />)
    expect(screen.getByText('リセット')).toBeInTheDocument()
  })

  it('renders the name input', () => {
    render(<App />)
    expect(screen.getByText('参加者（改行区切り）')).toBeInTheDocument()
  })

  it('renders the honorific checkbox', () => {
    render(<App />)
    expect(screen.getByText('名前に「さん」をつける')).toBeInTheDocument()
  })

  it('renders the share button', () => {
    render(<App />)
    expect(screen.getByText('🔗 共有リンクをコピー')).toBeInTheDocument()
  })

  it('shows placeholder when no names entered', () => {
    render(<App />)
    expect(screen.getByText(/2名以上の参加者を/)).toBeInTheDocument()
  })
})
