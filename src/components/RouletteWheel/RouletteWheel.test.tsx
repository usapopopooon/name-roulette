import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouletteWheel } from './RouletteWheel'

const items = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
]

describe('RouletteWheel', () => {
  it('should render placeholder when items is empty', () => {
    render(<RouletteWheel items={[]} rotation={0} />)

    expect(screen.getByText(/2名以上の参加者を/)).toBeInTheDocument()
  })

  it('should render SVG wheel when items are provided', () => {
    render(<RouletteWheel items={items} rotation={0} />)

    expect(screen.queryByText(/2名以上の参加者を/)).not.toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('should truncate long names', () => {
    render(
      <RouletteWheel
        items={[
          { id: 'long', label: 'とても長い名前です12345' },
          { id: 'b', label: 'B' },
        ]}
        rotation={0}
      />
    )

    expect(screen.getByText('とても長い名前で…')).toBeInTheDocument()
  })

  it('should render placeholder when only one item', () => {
    render(<RouletteWheel items={[{ id: 'a', label: 'A' }]} rotation={0} />)

    expect(screen.getByText(/2名以上の参加者を/)).toBeInTheDocument()
  })

  it('should apply rotation transform', () => {
    const { container } = render(
      <RouletteWheel items={items.slice(0, 2)} rotation={45} />
    )

    const group = container.querySelector('g[transform]')
    expect(group?.getAttribute('transform')).toContain('rotate(45')
  })

  it('should apply custom size', () => {
    const { container } = render(
      <RouletteWheel items={items.slice(0, 2)} rotation={0} size={400} />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).toBe('400px')
    expect(wrapper.style.height).toBe('400px')
  })

  it('should render correct number of segments', () => {
    const wheelItems = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
      { id: 'd', label: 'D' },
      { id: 'e', label: 'E' },
    ]
    const { container } = render(
      <RouletteWheel items={wheelItems} rotation={0} />
    )

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(wheelItems.length + 2)
  })

  it('should render all item names as text', () => {
    const wheelItems = [
      { id: 'tanaka-1', label: '田中さん' },
      { id: 'sato-1', label: '佐藤さん' },
      { id: 'suzuki-1', label: '鈴木さん' },
    ]
    render(<RouletteWheel items={wheelItems} rotation={0} />)

    wheelItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    })
  })
})
