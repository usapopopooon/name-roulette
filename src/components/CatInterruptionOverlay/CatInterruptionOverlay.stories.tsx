import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { CatInterruptionOverlay } from './CatInterruptionOverlay'

const meta = {
  title: 'Components/CatInterruptionOverlay',
  component: CatInterruptionOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CatInterruptionOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Cat: Story = {
  args: {
    show: true,
    type: 'cat',
    onComplete: fn(),
  },
}

export const Duck: Story = {
  args: {
    show: true,
    type: 'duck',
    onComplete: fn(),
  },
}

export const Hidden: Story = {
  args: {
    show: false,
    type: 'cat',
    onComplete: fn(),
  },
}
