import { useRef, useMemo, useEffect } from 'react'
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

export interface RouletteWheelItem {
  id: string
  label: string
}

export interface RouletteWheelProps {
  items: RouletteWheelItem[]
  weights?: number[]
  rotation: number
  size?: number
  isSpinning?: boolean
  onDragRotate?: (delta: number, timestamp: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onContextMenu?: (item: RouletteWheelItem, x: number, y: number) => void
}

export function RouletteWheel({
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

  const segmentAngles = useMemo(() => {
    const w = weights || items.map(() => 1)
    const totalWeight = w.reduce((sum, weight) => sum + weight, 0)
    return w.map((weight) => (weight / totalWeight) * 360)
  }, [items, weights])

  const startAngles = useMemo(() => {
    const angles: number[] = []
    let currentAngle = -90
    for (const angle of segmentAngles) {
      angles.push(currentAngle)
      currentAngle += angle
    }
    return angles
  }, [segmentAngles])

  useEffect(() => {
    if (items.length < 2) return

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

    if (
      lastSegmentIndexRef.current !== null &&
      lastSegmentIndexRef.current !== currentSegmentIndex
    ) {
      playClickSound()
    }
    lastSegmentIndexRef.current = currentSegmentIndex
  }, [rotation, segmentAngles, items.length])

  const getAngleFromCenter = (clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0
    const rect = svgRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onDragRotate) return
    isDraggingRef.current = true
    lastAngleRef.current = getAngleFromCenter(e.clientX, e.clientY)
    ;(e.target as Element).setPointerCapture(e.pointerId)
    onDragStart?.()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (
      !isDraggingRef.current ||
      !onDragRotate ||
      lastAngleRef.current === null
    ) {
      return
    }

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
    let delta = currentAngle - lastAngleRef.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    onDragRotate(delta, performance.now())
    lastAngleRef.current = currentAngle
  }

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      onDragEnd?.()
    }
    isDraggingRef.current = false
    lastAngleRef.current = null
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!onContextMenu) return

    e.preventDefault()

    const clickAngle = getAngleFromCenter(e.clientX, e.clientY)
    let adjustedAngle = clickAngle - rotation
    adjustedAngle = ((adjustedAngle % 360) + 360) % 360

    let accumulatedAngle = 0
    for (let i = 0; i < items.length; i++) {
      accumulatedAngle += segmentAngles[i]
      const normalizedClickAngle = (((adjustedAngle + 90) % 360) + 360) % 360
      if (normalizedClickAngle < accumulatedAngle) {
        onContextMenu(items[i], e.clientX, e.clientY)
        return
      }
    }
  }

  if (items.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-center text-white/60 text-lg leading-loose"
        style={{ width: size, height: size }}
      >
        2名以上の参加者を
        <br />
        入力してください
      </div>
    )
  }

  const radius = 135
  const centerX = 160
  const centerY = 160
  const outerRimRadius = 152
  const studCount = 36

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
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.4" />
          </filter>
          <filter
            id="center-shadow"
            x="120"
            y="120"
            width="80"
            height="80"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.4" />
          </filter>
          <filter
            id="pointer-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
          </filter>

          {/* Gold rim gradient */}
          <linearGradient id="rim-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="30%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="70%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          {/* Stud gradient */}
          <radialGradient id="stud-gradient">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </radialGradient>

          {/* Center hub gradient */}
          <linearGradient id="center-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          {/* Center gem gradient */}
          <linearGradient id="gem-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#C62828" />
          </linearGradient>

          {/* Pointer gradient */}
          <linearGradient id="pointer-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          {/* Glossy overlay for segments */}
          <radialGradient id="gloss-overlay" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer gold rim */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRimRadius}
          fill="none"
          stroke="url(#rim-gradient)"
          strokeWidth="14"
          filter="url(#shadow)"
        />

        {/* Inner rim highlight */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRimRadius - 7}
          fill="none"
          stroke="#B8860B"
          strokeWidth="1"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRimRadius + 7}
          fill="none"
          stroke="#B8860B"
          strokeWidth="1"
        />

        {/* Decorative studs */}
        {Array.from({ length: studCount }).map((_, i) => {
          const angle = (i * 360) / studCount
          const rad = (angle * Math.PI) / 180
          const sx = centerX + outerRimRadius * Math.cos(rad)
          const sy = centerY + outerRimRadius * Math.sin(rad)
          return (
            <circle
              key={`stud-${i}`}
              cx={sx}
              cy={sy}
              r="2.5"
              fill="url(#stud-gradient)"
            />
          )
        })}

        {/* Wheel segments */}
        <g transform={`rotate(${rotation}, ${centerX}, ${centerY})`}>
          {items.map((item, index) => {
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
            const showText = segmentAngle > 10
            const displayLabel =
              item.label.length > 8 ? `${item.label.slice(0, 8)}…` : item.label

            return (
              <g key={item.id}>
                <path
                  d={pathD}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
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
                    style={{
                      userSelect: 'none',
                      pointerEvents: 'none',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.5"
                    paintOrder="stroke"
                  >
                    {displayLabel}
                  </text>
                )}
              </g>
            )
          })}

          {/* Glossy highlight overlay */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="url(#gloss-overlay)"
            style={{ pointerEvents: 'none' }}
          />
        </g>

        {/* Center hub */}
        <g filter="url(#center-shadow)">
          {/* Outer ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r="24"
            fill="url(#center-gradient)"
            stroke="#B8860B"
            strokeWidth="1.5"
          />
          {/* Inner ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r="18"
            fill="none"
            stroke="rgba(255,248,220,0.5)"
            strokeWidth="1"
          />
          {/* Center gem */}
          <circle
            cx={centerX}
            cy={centerY}
            r="10"
            fill="url(#gem-gradient)"
            stroke="#B8860B"
            strokeWidth="1"
          />
        </g>

        {/* Pointer / indicator */}
        <g filter="url(#pointer-shadow)">
          <path
            d="M 148 2 L 172 2 L 160 40 Z"
            fill="url(#pointer-gradient)"
            stroke="#B8860B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Pointer highlight */}
          <path d="M 153 6 L 165 6 L 160 30 Z" fill="rgba(255,255,255,0.25)" />
        </g>
      </svg>
    </div>
  )
}
