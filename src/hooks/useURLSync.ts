import { useEffect, useCallback } from 'react'

export interface UseURLSyncOptions {
  names: string
  withHonorific: boolean
  lastWinner?: string | null
}

export interface UseURLSyncReturn {
  copyShareLink: () => Promise<boolean>
}

const updateURL = (
  names: string,
  withHonorific: boolean,
  lastWinner?: string | null
): void => {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams()
  const cleanNames = names
    .split('\n')
    .map((line) => line.replace(/さん$/, ''))
    .join('\n')

  if (cleanNames.trim()) {
    params.set('names', encodeURIComponent(cleanNames))
  }
  if (!withHonorific) {
    params.set('san', '0')
  }
  if (lastWinner) {
    // 「さん」を除いて保存
    const cleanWinner = lastWinner.replace(/さん$/, '')
    params.set('last', encodeURIComponent(cleanWinner))
  }

  const queryString = params.toString()
  const newURL = `${window.location.pathname}${queryString ? '?' + queryString : ''}`
  window.history.replaceState({}, '', newURL)
}

export const getLastWinnerFromURL = (): string | null => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const lastParam = params.get('last')
  if (lastParam) {
    try {
      return decodeURIComponent(lastParam)
    } catch {
      return null
    }
  }
  return null
}

export function useURLSync(options: UseURLSyncOptions): UseURLSyncReturn {
  const { names, withHonorific, lastWinner } = options

  useEffect(() => {
    updateURL(names, withHonorific, lastWinner)
  }, [names, withHonorific, lastWinner])

  const copyShareLink = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        return true
      } catch {
        return false
      }
    }
  }, [])

  return { copyShareLink }
}
