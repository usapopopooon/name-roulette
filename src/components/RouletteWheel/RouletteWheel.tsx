import { memo, useRef, useCallback, useMemo, useEffect } from 'react'
import { playClickSound } from '../../utils/sound'

const COLORS = [
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#8E24AA',
  '#FB8C00',
  '#00ACC1',
  '#D81B60',
  '#3949AB',
  '#7CB342',
  '#6D4C41',
  '#F4511E',
  '#039BE5',
  '#C0CA33',
  '#5E35B1',
  '#00897B',
  '#FFB300',
  '#E91E63',
  '#1565C0',
  '#2E7D32',
  '#AD1457',
]

export interface RouletteWheelProps {
  items: string[]
  weights?: number[]
  rotation: number
  size?: number
  isSpinning?: boolean
  onDragRotate?: (delta: number, timestamp: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onContextMenu?: (name: string, x: number, y: number) => void
}

export const RouletteWheel = memo(function RouletteWheel({
  items,
  weights,
  rotation,
  size = 320,
  onDragRotate,
  onDragStart,
  onDragEnd,
  onContextMenu,
}: RouletteWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const lastAngleRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const lastSegmentIndexRef = useRef<number | null>(null)

  // 重みから各セグメントの角度を計算
  const segmentAngles = useMemo(() => {
    const w = weights || items.map(() => 1)
    const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
    return w.map((weight) => (weight / totalWeight) * 360)
  }, [items, weights])

  // 各セグメントの開始角度を計算
  const startAngles = useMemo(() => {
    const angles: number[] = []
    let currentAngle = -90
    for (const angle of segmentAngles) {
      angles.push(currentAngle)
      currentAngle += angle
    }
    return angles
  }, [segmentAngles])

  // 回転中にセグメントを通過したらカチカチ音を鳴らす
  useEffect(() => {
    if (items.length < 2) return

    // 矢印（上部）が指しているセグメントを計算
    // 矢印は-90度の位置にあるので、回転を加味して現在どのセグメントが当たっているか判定
    const pointerAngle = (-rotation - 90 + 360 * 1000) % 360

    let accumulatedAngle = 0
    let currentSegmentIndex = 0
    for (let i = 0; i < segmentAngles.length; i++) {
      accumulatedAngle += segmentAngles[i]
      if (pointerAngle < accumulatedAngle) {
        currentSegmentIndex = i
        break
      }
    }

    // セグメントが変わったら音を鳴らす
    if (
      lastSegmentIndexRef.current !== null &&
      lastSegmentIndexRef.current !== currentSegmentIndex
    ) {
      playClickSound()
    }
    lastSegmentIndexRef.current = currentSegmentIndex
  }, [rotation, segmentAngles, items.length])

  const getAngleFromCenter = useCallback(
    (clientX: number, clientY: number): number => {
      if (!svgRef.current) return 0
      const rect = svgRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = clientX - centerX
      const dy = clientY - centerY
      return Math.atan2(dy, dx) * (180 / Math.PI)
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onDragRotate) return
      isDraggingRef.current = true
      lastAngleRef.current = getAngleFromCenter(e.clientX, e.clientY)
      ;(e.target as Element).setPointerCapture(e.pointerId)
      onDragStart?.()
    },
    [onDragRotate, getAngleFromCenter, onDragStart]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        !isDraggingRef.current ||
        !onDragRotate ||
        lastAngleRef.current === null
      )
        return
      const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
      let delta = currentAngle - lastAngleRef.current
      // -180〜180の範囲に正規化
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      onDragRotate(delta, performance.now())
      lastAngleRef.current = currentAngle
    },
    [onDragRotate, getAngleFromCenter]
  )

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      onDragEnd?.()
    }
    isDraggingRef.current = false
    lastAngleRef.current = null
  }, [onDragEnd])

  // 右クリック時にどのセグメントがクリックされたかを判定
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!onContextMenu) return

      e.preventDefault()

      // クリック位置から角度を計算
      const clickAngle = getAngleFromCenter(e.clientX, e.clientY)
      // 現在の回転を考慮して調整（回転の逆方向に補正）
      let adjustedAngle = clickAngle - rotation
      // 0-360に正規化
      adjustedAngle = ((adjustedAngle % 360) + 360) % 360

      // どのセグメントがクリックされたかを判定
      let accumulatedAngle = 0
      for (let i = 0; i < items.length; i++) {
        accumulatedAngle += segmentAngles[i]
        // startAnglesは-90から始まるので、adjustedAngleも-90基準に変換
        const normalizedClickAngle = (((adjustedAngle + 90) % 360) + 360) % 360
        if (normalizedClickAngle < accumulatedAngle) {
          onContextMenu(items[i], e.clientX, e.clientY)
          return
        }
      }
    },
    [onContextMenu, getAngleFromCenter, rotation, items, segmentAngles]
  )

  if (items.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-center text-gray-500 text-lg leading-loose"
        style={{ width: size, height: size }}
      >
        2名以上の参加者を
        <br />
        入力してください
      </div>
    )
  }

  const radius = 150
  const centerX = 160
  const centerY = 160

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        className={`w-full h-full overflow-visible ${onDragRotate ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
          </filter>
        </defs>

        <g
          transform={`rotate(${rotation}, ${centerX}, ${centerY})`}
          filter="url(#shadow)"
        >
          {items.map((name, index) => {
            const startAngle = startAngles[index]
            const segmentAngle = segmentAngles[index]
            const endAngle = startAngle + segmentAngle
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180

            const x1 = centerX + radius * Math.cos(startRad)
            const y1 = centerY + radius * Math.sin(startRad)
            const x2 = centerX + radius * Math.cos(endRad)
            const y2 = centerY + radius * Math.sin(endRad)

            const largeArc = segmentAngle > 180 ? 1 : 0

            const pathD = `
              M ${centerX} ${centerY}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `

            const textAngle = startAngle + segmentAngle / 2
            const textRad = (textAngle * Math.PI) / 180
            const textRadius = radius * 0.6
            const textX = centerX + textRadius * Math.cos(textRad)
            const textY = centerY + textRadius * Math.sin(textRad)

            const normalizedAngle = ((textAngle % 360) + 360) % 360
            const isLeftSide = normalizedAngle > 90 && normalizedAngle < 270
            const textRotation = isLeftSide ? textAngle + 180 : textAngle

            // セグメントが小さすぎる場合はテキストを表示しない
            const showText = segmentAngle > 10

            return (
              <g key={index}>
                <path
                  d={pathD}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                {showText && (
                  <text
                    x={textX}
                    y={textY}
                    fill="#fff"
                    fontSize={
                      segmentAngle < 20 ? '10' : items.length > 12 ? '12' : '14'
                    }
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    className="[text-shadow:1px_1px_2px_rgba(0,0,0,0.7)] pointer-events-none"
                  >
                    {name.length > 8 ? name.slice(0, 8) + '…' : name}
                  </text>
                )}
              </g>
            )
          })}

          <circle
            cx={centerX}
            cy={centerY}
            r="25"
            fill="#1a1a2e"
            stroke="#ffd700"
            strokeWidth="3"
          />
          <circle cx={centerX} cy={centerY} r="15" fill="#ffd700" />
        </g>

        <g filter="url(#shadow)">
          <polygon
            points={`${centerX - 15},12 ${centerX + 15},12 ${centerX},45`}
            fill="#ffd700"
            stroke="#fff"
            strokeWidth="2"
          />
          <polygon
            points={`${centerX - 10},8 ${centerX + 10},8 ${centerX},32`}
            fill="#ffec8b"
          />
        </g>
      </svg>
    </div>
  )
})
