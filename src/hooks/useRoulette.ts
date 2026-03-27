import { useState, useRef } from 'react'

export interface RouletteItem {
  id: string
  label: string
}

export interface UseRouletteOptions {
  onComplete?: (winnerId: string) => void
}

export interface SpinOptions {
  /** ちょっとだけ回す（動物乱入後用） */
  nudge?: boolean
}

export interface UseRouletteReturn {
  isSpinning: boolean
  rotation: number
  result: string | null
  spin: (
    items: RouletteItem[],
    weights?: number[],
    options?: SpinOptions
  ) => void
  reset: () => void
  addRotationWithVelocity: (delta: number, timestamp: number) => void
  setDragging: (
    dragging: boolean,
    items: RouletteItem[],
    weights?: number[]
  ) => void
  /** 結果を前後の候補にシフト（direction: -1 = 前, 1 = 次） */
  shiftResult: (
    direction: -1 | 1,
    items: RouletteItem[],
    weights?: number[]
  ) => void
}

export function useRoulette(
  options: UseRouletteOptions = {}
): UseRouletteReturn {
  const { onComplete } = options
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const animationRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const pendingItemsRef = useRef<RouletteItem[] | null>(null)
  const pendingWeightsRef = useRef<number[] | null>(null)
  const interruptedSpinItemsRef = useRef<RouletteItem[] | null>(null)
  const interruptedSpinWeightsRef = useRef<number[] | null>(null)
  const resultRef = useRef<string | null>(null)

  resultRef.current = result

  const velocityRef = useRef(0)
  const recentDeltasRef = useRef<{ delta: number; time: number }[]>([])

  const determineWinner = (
    items: RouletteItem[],
    weights?: number[],
    finalRotation?: number
  ) => {
    if (items.length < 2) return

    setIsSpinning(false)
    interruptedSpinItemsRef.current = null
    interruptedSpinWeightsRef.current = null

    const w = weights || items.map(() => 1)
    const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
    const segmentAngles = w.map((weight) => (weight / totalWeight) * 360)

    const rotationToUse = finalRotation ?? rotation
    const pointerAngle = (-rotationToUse + 360 * 1000) % 360

    let accumulatedAngle = 0
    let winnerIndex = 0
    for (let i = 0; i < segmentAngles.length; i++) {
      accumulatedAngle += segmentAngles[i]
      if (pointerAngle < accumulatedAngle) {
        winnerIndex = i
        break
      }
    }

    const winnerId = items[winnerIndex]?.id ?? null
    setResult(winnerId)
    if (winnerId) {
      onComplete?.(winnerId)
    }
  }

  const startInertiaAnimation = (
    initialVelocity: number,
    items: RouletteItem[],
    weights?: number[]
  ) => {
    if (Math.abs(initialVelocity) < 0.5) {
      if (pendingItemsRef.current) {
        const pendingItems = pendingItemsRef.current
        const pendingWeights = pendingWeightsRef.current
        pendingItemsRef.current = null
        pendingWeightsRef.current = null
        determineWinner(pendingItems, pendingWeights || undefined)
      }
      return
    }

    const totalRotation = initialVelocity * 60
    const duration = Math.min(Math.abs(initialVelocity) * 300, 7000)
    let startTime: number | null = null
    let startRotation = 0

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
        setRotation((prev) => {
          startRotation = prev
          return prev
        })
      }

      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 5)
      const currentRotation = startRotation + totalRotation * eased

      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
        const finalRotation = startRotation + totalRotation
        if (!isDraggingRef.current) {
          if (pendingItemsRef.current) {
            const pendingItems = pendingItemsRef.current
            const pendingWeights = pendingWeightsRef.current
            pendingItemsRef.current = null
            pendingWeightsRef.current = null
            determineWinner(
              pendingItems,
              pendingWeights || undefined,
              finalRotation
            )
          } else {
            determineWinner(items, weights, finalRotation)
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const spin = (
    items: RouletteItem[],
    weights?: number[],
    spinOptions?: SpinOptions
  ) => {
    if (items.length < 2 || isSpinning) return

    setIsSpinning(true)
    setResult(null)
    pendingItemsRef.current = null
    pendingWeightsRef.current = null
    interruptedSpinItemsRef.current = null
    interruptedSpinWeightsRef.current = null

    const startRotation = rotation
    let totalSpins: number
    let extraRotation: number
    let duration: number

    if (spinOptions?.nudge) {
      totalSpins = 0.15 + Math.random() * 0.2
      extraRotation = Math.random() * 360
      duration = 1800 + Math.random() * 600
    } else {
      totalSpins = 5 + Math.random() * 3
      extraRotation = Math.random() * 360
      duration = 6000 + Math.random() * 2000
    }

    const finalRotation = startRotation + totalSpins * 360 + extraRotation
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 5)
      const currentRotation =
        startRotation + (finalRotation - startRotation) * eased

      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else if (isDraggingRef.current) {
        pendingItemsRef.current = items
        pendingWeightsRef.current = weights || null
      } else {
        determineWinner(items, weights, finalRotation)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    pendingItemsRef.current = null
    pendingWeightsRef.current = null
    interruptedSpinItemsRef.current = null
    interruptedSpinWeightsRef.current = null
    recentDeltasRef.current = []
    velocityRef.current = 0
    setIsSpinning(false)
    setResult(null)
  }

  const addRotationWithVelocity = (delta: number, timestamp: number) => {
    recentDeltasRef.current.push({ delta, time: timestamp })
    recentDeltasRef.current = recentDeltasRef.current.filter(
      (d) => timestamp - d.time < 100
    )

    setRotation((prev) => prev + delta)
  }

  const setDragging = (
    dragging: boolean,
    items: RouletteItem[],
    weights?: number[]
  ) => {
    const wasDragging = isDraggingRef.current
    isDraggingRef.current = dragging

    if (dragging) {
      if (animationRef.current) {
        if (isSpinning && !resultRef.current) {
          interruptedSpinItemsRef.current = items
          interruptedSpinWeightsRef.current = weights || null
        }
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      recentDeltasRef.current = []
    } else if (wasDragging) {
      velocityRef.current = 0
      const now = performance.now()
      const recentDeltas = recentDeltasRef.current.filter(
        (d) => now - d.time < 100
      )

      if (recentDeltas.length >= 2) {
        const totalDelta = recentDeltas.reduce((sum, d) => sum + d.delta, 0)
        const timeSpan =
          recentDeltas[recentDeltas.length - 1].time - recentDeltas[0].time
        if (timeSpan > 0) {
          velocityRef.current = (totalDelta / timeSpan) * 16
        }
      }

      recentDeltasRef.current = []
      if (
        Math.abs(velocityRef.current) < 0.5 &&
        interruptedSpinItemsRef.current &&
        !pendingItemsRef.current
      ) {
        const interruptedItems = interruptedSpinItemsRef.current
        const interruptedWeights = interruptedSpinWeightsRef.current
        interruptedSpinItemsRef.current = null
        interruptedSpinWeightsRef.current = null
        startInertiaAnimation(
          18,
          interruptedItems,
          interruptedWeights || undefined
        )
        return
      }

      startInertiaAnimation(velocityRef.current, items, weights)
    }
  }

  const shiftResult = (
    direction: -1 | 1,
    items: RouletteItem[],
    weights?: number[]
  ) => {
    const currentResult = resultRef.current
    if (!currentResult || items.length < 2) return

    const currentIndex = items.findIndex((item) => item.id === currentResult)
    if (currentIndex === -1) return

    const newIndex = (currentIndex + direction + items.length) % items.length
    const newWinnerId = items[newIndex]?.id
    if (!newWinnerId) return

    setResult(newWinnerId)
    onComplete?.(newWinnerId)

    const w = weights || items.map(() => 1)
    const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
    const segmentAngles = w.map((weight) => (weight / totalWeight) * 360)

    let targetAngle = 0
    for (let i = 0; i < newIndex; i++) {
      targetAngle += segmentAngles[i]
    }
    targetAngle += segmentAngles[newIndex] / 2

    setRotation(-targetAngle)
  }

  return {
    isSpinning,
    rotation,
    result,
    spin,
    reset,
    addRotationWithVelocity,
    setDragging,
    shiftResult,
  }
}
