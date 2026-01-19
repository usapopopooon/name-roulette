import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

export interface UseNameListOptions {
  initialNames?: string
  withHonorific?: boolean
}

export interface UseNameListReturn {
  rawNames: string
  nameList: string[]
  displayNameList: string[]
  weights: number[]
  withHonorific: boolean
  setRawNames: (names: string) => void
  setWithHonorific: (value: boolean) => void
  handleNamesChange: (value: string) => void
  halveWeight: (name: string) => number[]
  doubleWeight: (name: string) => void
  excludeName: (name: string) => number[]
  restoreName: (name: string) => void
  removeName: (name: string) => void
  resetWeights: () => void
}

const getInitialHonorificFromURL = (): boolean => {
  if (typeof window === 'undefined') return true
  const params = new URLSearchParams(window.location.search)
  const sanParam = params.get('san')
  return sanParam !== '0'
}

const getInitialNamesFromURL = (withHonorific: boolean): string => {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  const namesParam = params.get('names')

  let names = ''
  if (namesParam) {
    try {
      names = decodeURIComponent(namesParam)
    } catch {
      names = ''
    }
  }

  if (withHonorific && names) {
    names = names
      .split('\n')
      .map((line) => {
        if (line.trim() && !line.endsWith('さん')) {
          return line + 'さん'
        }
        return line
      })
      .join('\n')
  }

  return names
}

export function useNameList(
  options: UseNameListOptions = {}
): UseNameListReturn {
  const [withHonorific, setWithHonorific] = useState(() => {
    if (options.withHonorific !== undefined) return options.withHonorific
    return getInitialHonorificFromURL()
  })

  const [rawNames, setRawNames] = useState(() => {
    if (options.initialNames !== undefined) return options.initialNames
    return getInitialNamesFromURL(withHonorific)
  })

  // 名前ごとの重み（キーは「さん」なしの名前）
  const [weightMap, setWeightMap] = useState<Record<string, number>>({})

  const nameList = useMemo(() => {
    return rawNames
      .split('\n')
      .map((n) => n.trim().replace(/さん$/, ''))
      .filter((n) => n)
  }, [rawNames])

  const displayNameList = useMemo(() => {
    return nameList.map((n) => (withHonorific ? `${n}さん` : n))
  }, [nameList, withHonorific])

  // nameListに対応した重みの配列
  const weights = useMemo(() => {
    return nameList.map((name) => weightMap[name] ?? 1)
  }, [nameList, weightMap])

  // 最新の値を参照するためのref
  const weightMapRef = useRef(weightMap)
  const nameListRef = useRef(nameList)
  weightMapRef.current = weightMap
  nameListRef.current = nameList

  useEffect(() => {
    if (!withHonorific) {
      setRawNames((prev) =>
        prev
          .split('\n')
          .map((line) => line.replace(/さん$/, ''))
          .join('\n')
      )
    }
  }, [withHonorific])

  const handleNamesChange = useCallback(
    (newValue: string) => {
      if (withHonorific) {
        const lines = newValue.split('\n')
        const processedLines = lines.map((line, index) => {
          if (
            index < lines.length - 1 &&
            line.trim() &&
            !line.endsWith('さん')
          ) {
            return line + 'さん'
          }
          return line
        })
        newValue = processedLines.join('\n')
      }
      setRawNames(newValue)
    },
    [withHonorific]
  )

  // 特定の名前の重みを半分にして、更新後のweightsを返す
  const halveWeight = useCallback((name: string): number[] => {
    // 「さん」付きで渡された場合は除去
    const baseName = name.replace(/さん$/, '')
    // refから最新の値を取得
    const currentWeightMap = weightMapRef.current
    const currentNameList = nameListRef.current
    const newWeight = (currentWeightMap[baseName] ?? 1) / 2
    const newWeightMap = {
      ...currentWeightMap,
      [baseName]: newWeight,
    }
    setWeightMap(newWeightMap)
    // 更新後のweightsを返す
    return currentNameList.map((n) => newWeightMap[n] ?? 1)
  }, [])

  // 特定の名前の重みを倍にする
  const doubleWeight = useCallback((name: string): void => {
    // 「さん」付きで渡された場合は除去
    const baseName = name.replace(/さん$/, '')
    const currentWeightMap = weightMapRef.current
    const newWeight = (currentWeightMap[baseName] ?? 1) * 2
    setWeightMap((prev) => ({
      ...prev,
      [baseName]: newWeight,
    }))
  }, [])

  // 特定の名前を除外（重みを0にする）して、更新後のweightsを返す
  const excludeName = useCallback((name: string): number[] => {
    // 「さん」付きで渡された場合は除去
    const baseName = name.replace(/さん$/, '')
    // refから最新の値を取得
    const currentWeightMap = weightMapRef.current
    const currentNameList = nameListRef.current
    const newWeightMap = {
      ...currentWeightMap,
      [baseName]: 0,
    }
    setWeightMap(newWeightMap)
    // 更新後のweightsを返す
    return currentNameList.map((n) => newWeightMap[n] ?? 1)
  }, [])

  // 除外された名前を復活（重みを1に戻す）
  const restoreName = useCallback((name: string): void => {
    // 「さん」付きで渡された場合は除去
    const baseName = name.replace(/さん$/, '')
    setWeightMap((prev) => {
      // 重みが0（除外されている）場合のみ復活
      if (prev[baseName] === 0) {
        const newMap = { ...prev }
        delete newMap[baseName] // デフォルトの1に戻す
        return newMap
      }
      return prev
    })
  }, [])

  // 名前をリストから完全に削除
  const removeName = useCallback((name: string): void => {
    // 「さん」付きで渡された場合は除去
    const baseName = name.replace(/さん$/, '')
    setRawNames((prev) => {
      const lines = prev.split('\n')
      const filtered = lines.filter((line) => {
        const lineName = line.trim().replace(/さん$/, '')
        return lineName !== baseName
      })
      return filtered.join('\n')
    })
    // weightMapからも削除
    setWeightMap((prev) => {
      if (baseName in prev) {
        const newMap = { ...prev }
        delete newMap[baseName]
        return newMap
      }
      return prev
    })
  }, [])

  // 全ての重みをリセット
  const resetWeights = useCallback(() => {
    setWeightMap({})
  }, [])

  return {
    rawNames,
    nameList,
    displayNameList,
    weights,
    withHonorific,
    setRawNames,
    setWithHonorific,
    handleNamesChange,
    halveWeight,
    doubleWeight,
    excludeName,
    restoreName,
    removeName,
    resetWeights,
  }
}
