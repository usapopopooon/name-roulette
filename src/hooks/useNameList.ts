import { useState, useEffect, useMemo, useRef } from 'react'

interface NameEntry {
  id: string
  name: string
}

export interface NameParticipant {
  id: string
  name: string
  displayName: string
  weight: number
}

export interface UseNameListOptions {
  initialNames?: string
  withHonorific?: boolean
}

export interface UseNameListReturn {
  rawNames: string
  nameList: string[]
  displayNameList: string[]
  participants: NameParticipant[]
  weights: number[]
  withHonorific: boolean
  setRawNames: (names: string) => void
  setWithHonorific: (value: boolean) => void
  handleNamesChange: (value: string) => void
  halveWeight: (id: string) => number[]
  doubleWeight: (id: string) => void
  excludeName: (id: string) => number[]
  restoreName: (id: string) => void
  removeName: (id: string) => void
  resetWeights: () => void
}

const normalizeName = (value: string): string =>
  value.trim().replace(/さん$/, '')

const parseNames = (value: string): string[] => {
  return value
    .split('\n')
    .map(normalizeName)
    .filter((name) => name)
}

const applyHonorificToCompletedLines = (value: string): string => {
  const lines = value.split('\n')
  return lines
    .map((line, index) => {
      if (index < lines.length - 1 && line.trim() && !line.endsWith('さん')) {
        return line + 'さん'
      }
      return line
    })
    .join('\n')
}

const serializeEntries = (
  entries: NameEntry[],
  withHonorific: boolean
): string => {
  return entries
    .map((entry) => (withHonorific ? `${entry.name}さん` : entry.name))
    .join('\n')
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

const createEntries = (names: string[]): NameEntry[] => {
  return names.map((name, index) => ({ id: `name-${index}`, name }))
}

const reconcileEntries = (
  previousEntries: NameEntry[],
  nextNames: string[],
  createId: () => string
): NameEntry[] => {
  const reusableEntries = new Map<string, NameEntry[]>()

  previousEntries.forEach((entry) => {
    const queue = reusableEntries.get(entry.name) ?? []
    queue.push(entry)
    reusableEntries.set(entry.name, queue)
  })

  return nextNames.map((name) => {
    const queue = reusableEntries.get(name)
    const entry = queue?.shift()
    return entry ?? { id: createId(), name }
  })
}

export function useNameList(
  options: UseNameListOptions = {}
): UseNameListReturn {
  const initialWithHonorific =
    options.withHonorific ?? getInitialHonorificFromURL()
  const initialRawNames =
    options.initialNames ?? getInitialNamesFromURL(initialWithHonorific)
  const initialEntries = createEntries(parseNames(initialRawNames))

  const [withHonorific, setWithHonorific] = useState(initialWithHonorific)
  const [rawNames, setRawNames] = useState(initialRawNames)
  const [entries, setEntries] = useState<NameEntry[]>(initialEntries)

  // 参加者ごとの重み（キーは内部ID）
  const [weightMap, setWeightMap] = useState<Record<string, number>>({})
  const nextIdRef = useRef(initialEntries.length)

  const nameList = useMemo(() => {
    return entries.map((entry) => entry.name)
  }, [entries])

  const displayNameList = useMemo(() => {
    return entries.map((entry) =>
      withHonorific ? `${entry.name}さん` : entry.name
    )
  }, [entries, withHonorific])

  const participants = useMemo(() => {
    return entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      displayName: withHonorific ? `${entry.name}さん` : entry.name,
      weight: weightMap[entry.id] ?? 1,
    }))
  }, [entries, withHonorific, weightMap])

  const weights = useMemo(() => {
    return participants.map((participant) => participant.weight)
  }, [participants])

  const weightMapRef = useRef(weightMap)
  const entriesRef = useRef(entries)
  weightMapRef.current = weightMap
  entriesRef.current = entries

  const createId = () => {
    const id = `name-${nextIdRef.current}`
    nextIdRef.current += 1
    return id
  }

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

  const updateNames = (nextRawNames: string) => {
    setRawNames(nextRawNames)
    const nextNames = parseNames(nextRawNames)
    setEntries((prevEntries) =>
      reconcileEntries(prevEntries, nextNames, createId)
    )
  }

  const handleNamesChange = (newValue: string) => {
    const nextRawNames = withHonorific
      ? applyHonorificToCompletedLines(newValue)
      : newValue

    updateNames(nextRawNames)
  }

  const getUpdatedWeights = (
    id: string,
    update: (currentWeight: number) => number
  ): number[] => {
    const currentWeightMap = weightMapRef.current
    const nextWeightMap = {
      ...currentWeightMap,
      [id]: update(currentWeightMap[id] ?? 1),
    }

    setWeightMap(nextWeightMap)
    return entriesRef.current.map((entry) => nextWeightMap[entry.id] ?? 1)
  }

  const halveWeight = (id: string): number[] => {
    return getUpdatedWeights(id, (currentWeight) => currentWeight / 2)
  }

  const doubleWeight = (id: string): void => {
    setWeightMap((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 1) * 2,
    }))
  }

  const excludeName = (id: string): number[] => {
    return getUpdatedWeights(id, () => 0)
  }

  const restoreName = (id: string): void => {
    setWeightMap((prev) => {
      if (!(id in prev)) {
        return prev
      }

      const nextMap = { ...prev }
      delete nextMap[id]
      return nextMap
    })
  }

  const removeName = (id: string): void => {
    const nextEntries = entriesRef.current.filter((entry) => entry.id !== id)
    setEntries(nextEntries)
    setRawNames(serializeEntries(nextEntries, withHonorific))
    setWeightMap((prev) => {
      if (!(id in prev)) {
        return prev
      }

      const nextMap = { ...prev }
      delete nextMap[id]
      return nextMap
    })
  }

  const resetWeights = () => {
    setWeightMap({})
  }

  return {
    rawNames,
    nameList,
    displayNameList,
    participants,
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
