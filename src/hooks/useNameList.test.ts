import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNameList } from './useNameList'

describe('useNameList', () => {
  beforeEach(() => {
    // Reset URL
    window.history.replaceState({}, '', '/')
  })

  it('should initialize with empty names by default', () => {
    const { result } = renderHook(() => useNameList())

    expect(result.current.rawNames).toBe('')
    expect(result.current.nameList).toEqual([])
    expect(result.current.displayNameList).toEqual([])
  })

  it('should initialize with provided initial names', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中\n佐藤', withHonorific: false })
    )

    expect(result.current.rawNames).toBe('田中\n佐藤')
    expect(result.current.nameList).toEqual(['田中', '佐藤'])
  })

  it('should add honorific to display names when withHonorific is true', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中\n佐藤', withHonorific: true })
    )

    expect(result.current.displayNameList).toEqual(['田中さん', '佐藤さん'])
  })

  it('should not add honorific to display names when withHonorific is false', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中\n佐藤', withHonorific: false })
    )

    expect(result.current.displayNameList).toEqual(['田中', '佐藤'])
  })

  it('should update names via setRawNames', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '', withHonorific: false })
    )

    act(() => {
      result.current.setRawNames('新しい名前\nもう一人')
    })

    expect(result.current.nameList).toEqual(['新しい名前', 'もう一人'])
  })

  it('should filter empty lines from nameList', () => {
    const { result } = renderHook(() =>
      useNameList({
        initialNames: '田中\n\n佐藤\n  \n鈴木',
        withHonorific: false,
      })
    )

    expect(result.current.nameList).toEqual(['田中', '佐藤', '鈴木'])
  })

  it('should strip さん suffix when calculating nameList', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中さん\n佐藤さん', withHonorific: true })
    )

    expect(result.current.nameList).toEqual(['田中', '佐藤'])
  })

  it('should toggle withHonorific', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中', withHonorific: true })
    )

    expect(result.current.withHonorific).toBe(true)

    act(() => {
      result.current.setWithHonorific(false)
    })

    expect(result.current.withHonorific).toBe(false)
  })

  it('should remove さん suffix when turning off honorific', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '田中さん\n佐藤さん', withHonorific: true })
    )

    act(() => {
      result.current.setWithHonorific(false)
    })

    expect(result.current.rawNames).toBe('田中\n佐藤')
  })

  it('should auto-add さん via handleNamesChange when honorific is on', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '', withHonorific: true })
    )

    act(() => {
      result.current.handleNamesChange('田中\n佐藤')
    })

    // Only completed lines (not the last one) should have さん
    expect(result.current.rawNames).toBe('田中さん\n佐藤')
  })

  it('should not auto-add さん via handleNamesChange when honorific is off', () => {
    const { result } = renderHook(() =>
      useNameList({ initialNames: '', withHonorific: false })
    )

    act(() => {
      result.current.handleNamesChange('田中\n佐藤')
    })

    expect(result.current.rawNames).toBe('田中\n佐藤')
  })

  it('should read names from URL parameter', () => {
    window.history.replaceState(
      {},
      '',
      '/?names=' + encodeURIComponent('URLから\nテスト')
    )

    const { result } = renderHook(() => useNameList({ withHonorific: false }))

    expect(result.current.nameList).toEqual(['URLから', 'テスト'])
  })

  it('should read san parameter from URL', () => {
    window.history.replaceState({}, '', '/?san=0')

    const { result } = renderHook(() => useNameList())

    expect(result.current.withHonorific).toBe(false)
  })
})
