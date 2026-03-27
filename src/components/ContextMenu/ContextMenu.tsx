import { useEffect, useRef } from 'react'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

export interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    itemRefs.current[0]?.focus()

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      const currentIndex = itemRefs.current.findIndex(
        (item) => item === document.activeElement
      )

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
        itemRefs.current[nextIndex]?.focus()
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const nextIndex =
          currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
        itemRefs.current[nextIndex]?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [items.length, onClose])

  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - items.length * 40 - 20)

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[100] min-w-[180px] py-2 bg-dark-secondary/95 backdrop-blur-sm border border-gold/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          ref={(element) => {
            itemRefs.current[index] = element
          }}
          type="button"
          role="menuitem"
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
            item.danger
              ? 'text-red-400 hover:bg-red-500/20'
              : 'text-white hover:bg-gold/20'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
