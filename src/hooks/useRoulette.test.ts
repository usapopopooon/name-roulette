import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoulette } from './useRoulette'

describe('useRoulette', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('デフォルト値で初期化される', () => {
    const { result } = renderHook(() => useRoulette())

    expect(result.current.isSpinning).toBe(false)
    expect(result.current.rotation).toBe(0)
    expect(result.current.result).toBeNull()
  })

  test('アイテムが2つ未満の場合は回転しない', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(['only one'])
    })

    expect(result.current.isSpinning).toBe(false)
  })

  test('アイテムが2つ以上の場合は回転を開始する', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(['item1', 'item2'])
    })

    expect(result.current.isSpinning).toBe(true)
    expect(result.current.result).toBeNull()
  })

  test('回転中は新たに回転を開始しない', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(['item1', 'item2'])
    })

    const rotationAfterFirstSpin = result.current.rotation

    act(() => {
      result.current.spin(['item1', 'item2', 'item3'])
    })

    expect(result.current.rotation).toBe(rotationAfterFirstSpin)
  })

  test('リセットで状態が正しく初期化される', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(['item1', 'item2'])
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.isSpinning).toBe(false)
    expect(result.current.result).toBeNull()
  })

  test('spinとreset関数が提供される', () => {
    const { result } = renderHook(() => useRoulette())

    expect(typeof result.current.spin).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  test('onCompleteオプションを受け付ける', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useRoulette({ onComplete }))

    expect(result.current.isSpinning).toBe(false)
  })

  describe('shiftResult', () => {
    test('shiftResult関数が提供される', () => {
      const { result } = renderHook(() => useRoulette())

      expect(typeof result.current.shiftResult).toBe('function')
    })

    test('resultがnullの場合はシフトしない', () => {
      const { result } = renderHook(() => useRoulette())
      const items = ['item1', 'item2', 'item3']

      act(() => {
        result.current.shiftResult(1, items)
      })

      expect(result.current.result).toBeNull()
    })

    test('アイテムが2つ未満の場合はシフトしない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))

      act(() => {
        result.current.shiftResult(1, ['item1'])
      })

      expect(onComplete).not.toHaveBeenCalled()
    })

    test('シフト時にonCompleteが呼ばれる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))
      const items = ['item1', 'item2', 'item3']

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      const winner = result.current.result
      if (winner) {
        onComplete.mockClear()

        act(() => {
          result.current.shiftResult(1, items)
        })

        expect(onComplete).toHaveBeenCalledTimes(1)
      }
    })

    test('最後のアイテムから前方シフトすると最初のアイテムに戻る（ループ）', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))
      const items = ['item1', 'item2', 'item3']

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      if (result.current.result) {
        const currentIndex = items.indexOf(result.current.result)
        const shiftsToEnd =
          (items.length - 1 - currentIndex + items.length) % items.length

        for (let i = 0; i < shiftsToEnd; i++) {
          act(() => {
            result.current.shiftResult(1, items)
          })
        }

        expect(result.current.result).toBe('item3')

        act(() => {
          result.current.shiftResult(1, items)
        })

        expect(result.current.result).toBe('item1')
      }
    })

    test('最初のアイテムから後方シフトすると最後のアイテムに戻る（ループ）', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))
      const items = ['item1', 'item2', 'item3']

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      if (result.current.result) {
        const currentIndex = items.indexOf(result.current.result)
        const shiftsToStart = currentIndex

        for (let i = 0; i < shiftsToStart; i++) {
          act(() => {
            result.current.shiftResult(-1, items)
          })
        }

        expect(result.current.result).toBe('item1')

        act(() => {
          result.current.shiftResult(-1, items)
        })

        expect(result.current.result).toBe('item3')
      }
    })

    test('シフト時に回転角度が更新される', () => {
      const { result } = renderHook(() => useRoulette())
      const items = ['item1', 'item2', 'item3']

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      if (result.current.result) {
        const rotationBefore = result.current.rotation

        act(() => {
          result.current.shiftResult(1, items)
        })

        expect(result.current.rotation).not.toBe(rotationBefore)
      }
    })
  })
})
