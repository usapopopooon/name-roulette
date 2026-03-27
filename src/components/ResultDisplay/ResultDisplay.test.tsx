import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultDisplay } from './ResultDisplay'

const candidates = [
  { id: 'tanaka-1', label: '田中さん' },
  { id: 'suzuki-1', label: '鈴木さん' },
  { id: 'sato-1', label: '佐藤さん' },
]

describe('ResultDisplay', () => {
  test('resultがnullの場合は何も表示しない', () => {
    const { container } = render(
      <ResultDisplay resultId={null} resultLabel={null} />
    )

    expect(container.firstChild).toBeNull()
  })

  test('当選者ラベルと名前を表示する', () => {
    render(<ResultDisplay resultId="tanaka-1" resultLabel="田中さん" />)

    expect(screen.getByText('🎉 当選者 🎉')).toBeInTheDocument()
    expect(screen.getByText('田中さん')).toBeInTheDocument()
  })

  test('結果文字列をそのまま表示する', () => {
    render(<ResultDisplay resultId="test-1" resultLabel="テスト太郎さん" />)

    expect(screen.getByText('テスト太郎さん')).toBeInTheDocument()
  })

  test('fixed配置のオーバーレイとしてレンダリングされる', () => {
    const { container } = render(
      <ResultDisplay resultId="tanaka-1" resultLabel="田中さん" />
    )

    const overlay = container.firstChild as HTMLElement
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('inset-0')
  })

  test('onCloseが渡された場合は閉じるボタンを表示する', () => {
    render(
      <ResultDisplay
        resultId="tanaka-1"
        resultLabel="田中さん"
        onClose={() => {}}
      />
    )

    expect(screen.getByText('閉じる')).toBeInTheDocument()
  })

  test('onCloseが渡されない場合は閉じるボタンを表示しない', () => {
    render(<ResultDisplay resultId="tanaka-1" resultLabel="田中さん" />)

    expect(screen.queryByText('閉じる')).not.toBeInTheDocument()
  })

  test('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const onClose = vi.fn()
    render(
      <ResultDisplay
        resultId="tanaka-1"
        resultLabel="田中さん"
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('閉じる'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('オーバーレイ背景をクリックするとonCloseが呼ばれる', () => {
    const onClose = vi.fn()
    render(
      <ResultDisplay
        resultId="tanaka-1"
        resultLabel="田中さん"
        onClose={onClose}
      />
    )

    const overlay = document.querySelector('.z-50') as HTMLElement
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('モーダル内容をクリックしてもonCloseは呼ばれない', () => {
    const onClose = vi.fn()
    render(
      <ResultDisplay
        resultId="tanaka-1"
        resultLabel="田中さん"
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('田中さん'))

    expect(onClose).not.toHaveBeenCalled()
  })

  test('dialogロールを持つ', () => {
    render(<ResultDisplay resultId="tanaka-1" resultLabel="田中さん" />)

    expect(screen.getByRole('dialog', { name: '抽選結果' })).toBeInTheDocument()
  })

  describe('シフト用コンテキストメニュー', () => {
    test('candidatesとonShiftが渡された場合、右クリックでコンテキストメニューを表示する', () => {
      const onShift = vi.fn()
      render(
        <ResultDisplay
          resultId="tanaka-1"
          resultLabel="田中さん"
          candidates={candidates}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))

      expect(screen.getByText(/次の人にする/)).toBeInTheDocument()
      expect(screen.getByText(/鈴木さん/)).toBeInTheDocument()
    })

    test('最後の候補者の場合、次は最初の候補者を表示する（ループ）', () => {
      const onShift = vi.fn()
      render(
        <ResultDisplay
          resultId="sato-1"
          resultLabel="佐藤さん"
          candidates={candidates}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('佐藤さん'))

      expect(screen.getByText(/田中さん/)).toBeInTheDocument()
    })

    test('同名の候補でも現在のidを基準に次候補を選べる', () => {
      const onShift = vi.fn()
      render(
        <ResultDisplay
          resultId="tanaka-2"
          resultLabel="田中さん"
          candidates={[
            { id: 'tanaka-1', label: '田中さん' },
            { id: 'tanaka-2', label: '田中さん' },
            { id: 'sato-1', label: '佐藤さん' },
          ]}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))

      expect(screen.getByText(/佐藤さん/)).toBeInTheDocument()
    })

    test('メニュー項目をクリックするとonShiftが方向1で呼ばれる', () => {
      const onShift = vi.fn()
      render(
        <ResultDisplay
          resultId="tanaka-1"
          resultLabel="田中さん"
          candidates={candidates}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))
      fireEvent.click(screen.getByText(/次の人にする/))

      expect(onShift).toHaveBeenCalledWith(1)
    })

    test('onShiftが渡されない場合はコンテキストメニューを表示しない', () => {
      render(
        <ResultDisplay
          resultId="tanaka-1"
          resultLabel="田中さん"
          candidates={candidates}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))

      expect(screen.queryByText(/次の人にする/)).not.toBeInTheDocument()
    })

    test('候補者が1人の場合はコンテキストメニューを表示しない', () => {
      const onShift = vi.fn()
      render(
        <ResultDisplay
          resultId="tanaka-1"
          resultLabel="田中さん"
          candidates={[{ id: 'tanaka-1', label: '田中さん' }]}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))

      expect(screen.queryByText(/次の人にする/)).not.toBeInTheDocument()
    })

    test('resultが変わるとコンテキストメニューが閉じる', () => {
      const onShift = vi.fn()
      const { rerender } = render(
        <ResultDisplay
          resultId="tanaka-1"
          resultLabel="田中さん"
          candidates={candidates}
          onShift={onShift}
        />
      )

      fireEvent.contextMenu(screen.getByText('田中さん'))
      expect(screen.getByText(/次の人にする/)).toBeInTheDocument()

      rerender(
        <ResultDisplay
          resultId="suzuki-1"
          resultLabel="鈴木さん"
          candidates={candidates}
          onShift={onShift}
        />
      )

      expect(screen.queryByText(/次の人にする/)).not.toBeInTheDocument()
    })
  })
})
