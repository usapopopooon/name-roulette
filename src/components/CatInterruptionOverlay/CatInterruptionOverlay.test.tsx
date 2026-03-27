import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CatInterruptionOverlay } from './CatInterruptionOverlay'

describe('CatInterruptionOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('showがfalseの場合は何も表示しない', () => {
    const { container } = render(<CatInterruptionOverlay show={false} />)

    expect(container.firstChild).toBeNull()
  })

  test('showがtrueの場合に猫の通過テキストを表示する', () => {
    render(<CatInterruptionOverlay show={true} type="cat" />)

    expect(screen.getByText('🐾 猫が暴れ中... 🐾')).toBeInTheDocument()
  })

  test('typeがduckの場合にアヒルの行進テキストを表示する', () => {
    render(<CatInterruptionOverlay show={true} type="duck" />)

    expect(screen.getByText('🦆 アヒルが行進中... 🦆')).toBeInTheDocument()
  })

  test('typeが指定されない場合はデフォルトで猫を表示する', () => {
    render(<CatInterruptionOverlay show={true} />)

    expect(screen.getByText('🐾 猫が暴れ中... 🐾')).toBeInTheDocument()
  })

  test('猫の絵文字を表示する', () => {
    render(<CatInterruptionOverlay show={true} type="cat" />)

    expect(screen.getByText('🐱')).toBeInTheDocument()
  })

  test('猫の場合は左右から前足アイコンを複数表示する', () => {
    render(<CatInterruptionOverlay show={true} type="cat" />)

    expect(screen.getAllByText('🐾')).toHaveLength(4)
  })

  test('アヒルの場合は親アヒルと子アヒル3匹を表示する', () => {
    render(<CatInterruptionOverlay show={true} type="duck" />)

    const ducks = screen.getAllByText('🦆')
    expect(ducks).toHaveLength(4) // 親1匹 + 子3匹
  })

  test('2.5秒後にonCompleteが呼ばれる', () => {
    const onComplete = vi.fn()
    render(<CatInterruptionOverlay show={true} onComplete={onComplete} />)

    expect(onComplete).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2500)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  test('showがfalseに変わるとタイマーがクリアされる', () => {
    const onComplete = vi.fn()
    const { rerender } = render(
      <CatInterruptionOverlay show={true} onComplete={onComplete} />
    )

    vi.advanceTimersByTime(1000)
    expect(onComplete).not.toHaveBeenCalled()

    rerender(<CatInterruptionOverlay show={false} onComplete={onComplete} />)

    vi.advanceTimersByTime(2000)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('fixed配置のオーバーレイとしてレンダリングされる', () => {
    const { container } = render(<CatInterruptionOverlay show={true} />)

    const overlay = container.firstChild as HTMLElement
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('inset-0')
  })

  test('pointer-events-noneでクリックを透過する', () => {
    const { container } = render(<CatInterruptionOverlay show={true} />)

    const overlay = container.firstChild as HTMLElement
    expect(overlay.className).toContain('pointer-events-none')
  })
})
