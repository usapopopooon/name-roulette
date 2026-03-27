import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoulette, type RouletteItem } from './useRoulette'

const items: RouletteItem[] = [
  { id: 'item-1', label: 'item1' },
  { id: 'item-2', label: 'item2' },
  { id: 'item-3', label: 'item3' },
]

describe('useRoulette', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', ((callback: FrameRequestCallback) =>
      window.setTimeout(
        () => callback(Date.now()),
        16
      )) as typeof requestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', ((id: number) =>
      window.clearTimeout(id)) as typeof cancelAnimationFrame)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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
      result.current.spin([{ id: 'only-one', label: 'only one' }])
    })

    expect(result.current.isSpinning).toBe(false)
  })

  test('アイテムが2つ以上の場合は回転を開始する', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(items.slice(0, 2))
    })

    expect(result.current.isSpinning).toBe(true)
    expect(result.current.result).toBeNull()
  })

  test('回転中は新たに回転を開始しない', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(items.slice(0, 2))
    })

    const rotationAfterFirstSpin = result.current.rotation

    act(() => {
      result.current.spin(items)
    })

    expect(result.current.rotation).toBe(rotationAfterFirstSpin)
  })

  test('リセットで状態が正しく初期化される', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(items.slice(0, 2))
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

  test('回転中に触って一瞬止まっても、離したら回転が再開して当選まで進む', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(items)
      vi.advanceTimersByTime(200)
    })

    const rotationBeforeInterrupt = result.current.rotation

    act(() => {
      result.current.setDragging(true, items)
      result.current.setDragging(false, items)
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.rotation).not.toBe(rotationBeforeInterrupt)

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.isSpinning).toBe(false)
    expect(result.current.result).not.toBeNull()
  })

  test('nudge抽選でも全角度の回転量を使える', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.spin(items, undefined, { nudge: true })
      vi.advanceTimersByTime(10000)
    })

    // 0.9 のとき extraRotation は 324 度で、短め演出でも 400 度超の回転になる
    expect(result.current.rotation).toBeGreaterThan(400)
    randomSpy.mockRestore()
  })

  test('移動なしでドラッグ終了したときに前回の慣性速度を再利用しない', () => {
    const { result } = renderHook(() => useRoulette())

    act(() => {
      result.current.setDragging(true, items)
      result.current.addRotationWithVelocity(40, 1000)
      result.current.addRotationWithVelocity(40, 1050)
      result.current.setDragging(false, items)
      vi.advanceTimersByTime(5000)
    })

    const rotationBeforeIdleRelease = result.current.rotation

    act(() => {
      result.current.setDragging(true, items)
      result.current.setDragging(false, items)
      vi.advanceTimersByTime(200)
    })

    expect(result.current.rotation).toBe(rotationBeforeIdleRelease)
  })

  describe('shiftResult', () => {
    test('shiftResult関数が提供される', () => {
      const { result } = renderHook(() => useRoulette())

      expect(typeof result.current.shiftResult).toBe('function')
    })

    test('resultがnullの場合はシフトしない', () => {
      const { result } = renderHook(() => useRoulette())

      act(() => {
        result.current.shiftResult(1, items)
      })

      expect(result.current.result).toBeNull()
    })

    test('アイテムが2つ未満の場合はシフトしない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))

      act(() => {
        result.current.shiftResult(1, [{ id: 'item-1', label: 'item1' }])
      })

      expect(onComplete).not.toHaveBeenCalled()
    })

    test('シフト時にonCompleteが呼ばれる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useRoulette({ onComplete }))

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
      const { result } = renderHook(() => useRoulette())

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      if (result.current.result) {
        const currentIndex = items.findIndex(
          (item) => item.id === result.current.result
        )
        const shiftsToEnd =
          (items.length - 1 - currentIndex + items.length) % items.length

        for (let i = 0; i < shiftsToEnd; i++) {
          act(() => {
            result.current.shiftResult(1, items)
          })
        }

        expect(result.current.result).toBe('item-3')

        act(() => {
          result.current.shiftResult(1, items)
        })

        expect(result.current.result).toBe('item-1')
      }
    })

    test('最初のアイテムから後方シフトすると最後のアイテムに戻る（ループ）', () => {
      const { result } = renderHook(() => useRoulette())

      act(() => {
        result.current.spin(items)
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      if (result.current.result) {
        const currentIndex = items.findIndex(
          (item) => item.id === result.current.result
        )
        const shiftsToStart = currentIndex

        for (let i = 0; i < shiftsToStart; i++) {
          act(() => {
            result.current.shiftResult(-1, items)
          })
        }

        expect(result.current.result).toBe('item-1')

        act(() => {
          result.current.shiftResult(-1, items)
        })

        expect(result.current.result).toBe('item-3')
      }
    })

    test('シフト時に回転角度が更新される', () => {
      const { result } = renderHook(() => useRoulette())

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
