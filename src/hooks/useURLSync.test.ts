import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useURLSync } from './useURLSync'

describe('useURLSync', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('should update URL with names', () => {
    renderHook(() => useURLSync({ names: '田中\n佐藤', withHonorific: true }))

    expect(window.location.search).toContain('names=')
  })

  it('should add san=0 when honorific is off', () => {
    renderHook(() => useURLSync({ names: '田中', withHonorific: false }))

    expect(window.location.search).toContain('san=0')
  })

  it('should not add san parameter when honorific is on', () => {
    renderHook(() => useURLSync({ names: '田中', withHonorific: true }))

    expect(window.location.search).not.toContain('san=')
  })

  it('should strip さん suffix from URL', () => {
    renderHook(() =>
      useURLSync({ names: '田中さん\n佐藤さん', withHonorific: true })
    )

    const decoded = decodeURIComponent(
      decodeURIComponent(window.location.search)
    )
    expect(decoded).not.toContain('さん')
  })

  it('should return empty search when names is empty', () => {
    renderHook(() => useURLSync({ names: '', withHonorific: true }))

    expect(window.location.search).toBe('')
  })

  it('should update URL when names change', () => {
    const { rerender } = renderHook(
      ({ names, withHonorific }) => useURLSync({ names, withHonorific }),
      { initialProps: { names: '田中', withHonorific: true } }
    )

    const decoded1 = decodeURIComponent(
      decodeURIComponent(window.location.search)
    )
    expect(decoded1).toContain('田中')

    rerender({ names: '佐藤', withHonorific: true })

    const decoded2 = decodeURIComponent(
      decodeURIComponent(window.location.search)
    )
    expect(decoded2).toContain('佐藤')
    expect(decoded2).not.toContain('田中')
  })

  describe('copyShareLink', () => {
    it('should copy URL to clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: { writeText },
      })

      const { result } = renderHook(() =>
        useURLSync({ names: '田中', withHonorific: true })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.copyShareLink()
      })

      expect(success).toBe(true)
      expect(writeText).toHaveBeenCalledWith(window.location.href)
    })
  })
})
