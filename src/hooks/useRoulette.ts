import { useState, useRef, useCallback } from 'react'

export interface UseRouletteOptions {
  onComplete?: (winner: string) => void
}

export interface UseRouletteReturn {
  isSpinning: boolean
  rotation: number
  result: string | null
  spin: (items: string[], weights?: number[]) => void
  reset: () => void
  addRotationWithVelocity: (delta: number, timestamp: number) => void
  setDragging: (dragging: boolean, items: string[], weights?: number[]) => void
  /** 結果を前後の候補にシフト（direction: -1 = 前, 1 = 次） */
  shiftResult: (direction: -1 | 1, items: string[], weights?: number[]) => void
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
  const pendingItemsRef = useRef<string[] | null>(null)
  const pendingWeightsRef = useRef<number[] | null>(null)
  const resultRef = useRef<string | null>(null)

  // resultが変わったらrefも更新
  resultRef.current = result

  // 速度追跡用
  const velocityRef = useRef(0)
  const lastDeltaTimeRef = useRef(0)
  const recentDeltasRef = useRef<{ delta: number; time: number }[]>([])

  // 重みを考慮して勝者を決定
  // finalRotationを直接受け取ることで、クロージャの古い値問題を回避
  const determineWinner = useCallback(
    (items: string[], weights?: number[], finalRotation?: number) => {
      if (items.length < 2) return

      setIsSpinning(false)

      // 重みから各セグメントの角度を計算
      const w = weights || items.map(() => 1)
      const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
      const segmentAngles = w.map((weight) => (weight / totalWeight) * 360)

      // finalRotationが渡された場合はそれを使用（アニメーション終了時の正確な値）
      // セグメントは-90度から描画開始されているため、ここでは-90オフセット不要
      const rotationToUse = finalRotation ?? rotation
      const pointerAngle = (-rotationToUse + 360 * 1000) % 360

      // どのセグメントがポインターの下にあるか
      let accumulatedAngle = 0
      let winnerIndex = 0
      for (let i = 0; i < segmentAngles.length; i++) {
        accumulatedAngle += segmentAngles[i]
        if (pointerAngle < accumulatedAngle) {
          winnerIndex = i
          break
        }
      }

      const winner = items[winnerIndex]
      setResult(winner)
      onComplete?.(winner)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rotationは意図的に除外（finalRotationを優先使用するため）
    [onComplete]
  )

  // 慣性アニメーション - 最後がじわじわゆっくりになる
  const startInertiaAnimation = useCallback(
    (initialVelocity: number, items: string[], weights?: number[]) => {
      if (Math.abs(initialVelocity) < 0.5) {
        // 速度が小さすぎる場合は慣性なしで即座に勝者決定
        if (pendingItemsRef.current) {
          const pendingItems = pendingItemsRef.current
          const pendingWeights = pendingWeightsRef.current
          pendingItemsRef.current = null
          pendingWeightsRef.current = null
          determineWinner(pendingItems, pendingWeights || undefined)
        }
        return
      }

      // 初期速度から総回転量と所要時間を計算
      const totalRotation = initialVelocity * 60 // 速度に比例した回転量（少し増加）
      const duration = Math.min(Math.abs(initialVelocity) * 300, 7000) // 速度に比例した時間（最大7秒）
      let startTime: number | null = null
      let startRotation = 0

      const animate = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp
          // 現在の回転角度を取得
          setRotation((prev) => {
            startRotation = prev
            return prev
          })
        }

        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // ease-out-quint: 終盤が滑らかに1に収束するイージング
        // 1 - (1 - progress)^5 で progress=1 の時に正確に 1 になる
        const eased = 1 - Math.pow(1 - progress, 5)

        const currentRotation = startRotation + totalRotation * eased

        setRotation(currentRotation)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          animationRef.current = null
          // 最終回転角度を計算
          const finalRotation = startRotation + totalRotation
          // ドラッグ中でなければ勝者決定
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
    },
    [determineWinner]
  )

  const spin = useCallback(
    (items: string[], weights?: number[]) => {
      if (items.length < 2 || isSpinning) return

      setIsSpinning(true)
      setResult(null)
      pendingItemsRef.current = null
      pendingWeightsRef.current = null

      const totalSpins = 5 + Math.random() * 3
      const startRotation = rotation
      const finalRotation =
        startRotation + totalSpins * 360 + Math.random() * 360

      let startTime: number | null = null
      const duration = 6000 + Math.random() * 2000 // より長い時間（6〜8秒）

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // ease-out-quint: 終盤が滑らかに1に収束するイージング
        // 1 - (1 - progress)^5 で progress=1 の時に正確に 1 になる
        const eased = 1 - Math.pow(1 - progress, 5)

        const currentRotation =
          startRotation + (finalRotation - startRotation) * eased

        setRotation(currentRotation)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          // ドラッグ中なら勝者決定を保留
          if (isDraggingRef.current) {
            pendingItemsRef.current = items
            pendingWeightsRef.current = weights || null
          } else {
            // 最終回転角度を直接渡す
            determineWinner(items, weights, finalRotation)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [isSpinning, rotation, determineWinner]
  )

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    pendingItemsRef.current = null
    pendingWeightsRef.current = null
    recentDeltasRef.current = []
    velocityRef.current = 0
    setIsSpinning(false)
    setResult(null)
  }, [])

  const addRotationWithVelocity = useCallback(
    (delta: number, timestamp: number) => {
      // 直近のデルタを記録（100ms以内のものだけ保持）
      recentDeltasRef.current.push({ delta, time: timestamp })
      recentDeltasRef.current = recentDeltasRef.current.filter(
        (d) => timestamp - d.time < 100
      )
      lastDeltaTimeRef.current = timestamp

      setRotation((prev) => prev + delta)
    },
    []
  )

  const setDragging = useCallback(
    (dragging: boolean, items: string[], weights?: number[]) => {
      const wasDragging = isDraggingRef.current
      isDraggingRef.current = dragging

      if (dragging) {
        // ドラッグ開始時にアニメーションを停止
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
        recentDeltasRef.current = []
      } else if (wasDragging) {
        // ドラッグ終了時に速度を計算
        const now = performance.now()
        const recentDeltas = recentDeltasRef.current.filter(
          (d) => now - d.time < 100
        )

        if (recentDeltas.length >= 2) {
          // 直近のデルタから速度を計算
          const totalDelta = recentDeltas.reduce((sum, d) => sum + d.delta, 0)
          const timeSpan =
            recentDeltas[recentDeltas.length - 1].time - recentDeltas[0].time
          if (timeSpan > 0) {
            velocityRef.current = (totalDelta / timeSpan) * 16 // 16ms単位の速度に変換
          }
        }

        recentDeltasRef.current = []

        // 慣性アニメーションを開始
        startInertiaAnimation(velocityRef.current, items, weights)
      }
    },
    [startInertiaAnimation]
  )

  // 結果を前後の候補にシフト（ループする）
  const shiftResult = useCallback(
    (direction: -1 | 1, items: string[], weights?: number[]) => {
      const currentResult = resultRef.current
      if (!currentResult || items.length < 2) return

      const currentIndex = items.indexOf(currentResult)
      if (currentIndex === -1) return

      // ループするインデックス計算
      const newIndex = (currentIndex + direction + items.length) % items.length

      const newWinner = items[newIndex]
      setResult(newWinner)
      onComplete?.(newWinner)

      // ルーレットの回転角度も新しい当選者の位置に合わせて調整
      const w = weights || items.map(() => 1)
      const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
      const segmentAngles = w.map((weight) => (weight / totalWeight) * 360)

      // 新しい当選者の中心角度を計算
      let targetAngle = 0
      for (let i = 0; i < newIndex; i++) {
        targetAngle += segmentAngles[i]
      }
      targetAngle += segmentAngles[newIndex] / 2 // セグメントの中心

      // 回転角度を設定（ポインターは上部=-90度なので調整）
      setRotation(-targetAngle)
    },
    [onComplete]
  )

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
