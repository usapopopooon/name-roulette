import { memo, useMemo } from 'react'

const COLORS = [
  '#ff0000',
  '#ffd700',
  '#00ff00',
  '#00bfff',
  '#ff69b4',
  '#ff8c00',
  '#9400d3',
  '#ffffff',
]

interface FireworkParticle {
  id: number
  angle: number
  distance: number
  color: string
  size: number
  delay: number
}

interface Firework {
  id: number
  x: number
  y: number
  particles: FireworkParticle[]
  delay: number
}

export const Fireworks = memo(function Fireworks() {
  const fireworks = useMemo<Firework[]>(() => {
    // 8つの花火を異なる位置・タイミングで配置
    return Array.from({ length: 8 }, (_, i) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        id: i,
        x: 10 + Math.random() * 80, // 画面の10%〜90%
        y: 15 + Math.random() * 50, // 画面の15%〜65%
        delay: i * 0.25 + Math.random() * 0.15, // 順番に打ち上がる
        particles: Array.from({ length: 32 }, (_, j) => ({
          id: j,
          angle: (j * 360) / 32 + Math.random() * 8,
          distance: 80 + Math.random() * 80, // 大きく広がる
          color:
            Math.random() > 0.3
              ? color
              : COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 5 + Math.random() * 5, // より大きなパーティクル
          delay: Math.random() * 0.1,
        })),
      }
    })
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[55]">
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
        >
          {/* 打ち上げの光（下から上へ） */}
          <div
            className="absolute w-1 rounded-full animate-firework-launch"
            style={{
              height: '4px',
              left: '-2px',
              backgroundColor: '#fffacd',
              boxShadow: '0 0 6px 2px rgba(255, 250, 150, 0.8)',
              animationDelay: `${firework.delay}s`,
            }}
          />
          {/* 爆発するパーティクル */}
          {firework.particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-firework-particle opacity-0"
              style={
                {
                  width: particle.size,
                  height: particle.size,
                  left: -particle.size / 2,
                  top: -particle.size / 2,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  '--particle-angle': `${particle.angle}deg`,
                  '--particle-distance': `${particle.distance}px`,
                  animationDelay: `${firework.delay + 0.5 + particle.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
          {/* 中心の閃光 */}
          <div
            className="absolute w-8 h-8 bg-white rounded-full animate-firework-flash opacity-0"
            style={{
              left: '-16px',
              top: '-16px',
              boxShadow: '0 0 40px 20px rgba(255, 255, 255, 0.9)',
              animationDelay: `${firework.delay + 0.5}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
})
