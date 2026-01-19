import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouletteWheel } from './RouletteWheel'

describe('RouletteWheel', () => {
  it('should render placeholder when items is empty', () => {
    render(<RouletteWheel items={[]} rotation={0} />)

    expect(screen.getByText(/2名以上の参加者を/)).toBeInTheDocument()
  })

  it('should render SVG wheel when items are provided', () => {
    render(<RouletteWheel items={['A', 'B', 'C']} rotation={0} />)

    expect(screen.queryByText(/2名以上の参加者を/)).not.toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('should truncate long names', () => {
    render(
      <RouletteWheel items={['とても長い名前です12345', 'B']} rotation={0} />
    )

    // 8文字 + '…' = 'とても長い名前で…'
    expect(screen.getByText('とても長い名前で…')).toBeInTheDocument()
  })

  it('should render placeholder when only one item', () => {
    render(<RouletteWheel items={['A']} rotation={0} />)

    expect(screen.getByText(/2名以上の参加者を/)).toBeInTheDocument()
  })

  it('should apply rotation transform', () => {
    const { container } = render(
      <RouletteWheel items={['A', 'B']} rotation={45} />
    )

    const group = container.querySelector('g[transform]')
    expect(group?.getAttribute('transform')).toContain('rotate(45')
  })

  it('should apply custom size', () => {
    const { container } = render(
      <RouletteWheel items={['A', 'B']} rotation={0} size={400} />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).toBe('400px')
    expect(wrapper.style.height).toBe('400px')
  })

  it('should render correct number of segments', () => {
    const items = ['A', 'B', 'C', 'D', 'E']
    const { container } = render(<RouletteWheel items={items} rotation={0} />)

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(items.length)
  })

  it('should render all item names as text', () => {
    const items = ['田中さん', '佐藤さん', '鈴木さん']
    render(<RouletteWheel items={items} rotation={0} />)

    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })
})
