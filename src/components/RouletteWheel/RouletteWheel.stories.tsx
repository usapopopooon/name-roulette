import type { Meta, StoryObj } from '@storybook/react'
import { RouletteWheel } from './RouletteWheel'

const meta = {
  title: 'Components/RouletteWheel',
  component: RouletteWheel,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rotation: {
      control: { type: 'range', min: 0, max: 720, step: 1 },
    },
    size: {
      control: { type: 'range', min: 200, max: 600, step: 50 },
    },
  },
} satisfies Meta<typeof RouletteWheel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: ['田中さん', '佐藤さん', '鈴木さん', '高橋さん'],
    rotation: 0,
    size: 320,
  },
}

export const ManyItems: Story = {
  args: {
    items: [
      '田中さん',
      '佐藤さん',
      '鈴木さん',
      '高橋さん',
      '渡辺さん',
      '伊藤さん',
      '山本さん',
      '中村さん',
      '小林さん',
      '加藤さん',
      '吉田さん',
      '山田さん',
    ],
    rotation: 0,
    size: 320,
  },
}

export const TwoItems: Story = {
  args: {
    items: ['Aさん', 'Bさん'],
    rotation: 0,
    size: 320,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    rotation: 0,
    size: 320,
  },
}

export const Rotated: Story = {
  args: {
    items: ['田中さん', '佐藤さん', '鈴木さん', '高橋さん'],
    rotation: 45,
    size: 320,
  },
}

export const LargeSize: Story = {
  args: {
    items: ['田中さん', '佐藤さん', '鈴木さん', '高橋さん'],
    rotation: 0,
    size: 500,
  },
}

export const SmallSize: Story = {
  args: {
    items: ['田中さん', '佐藤さん', '鈴木さん', '高橋さん'],
    rotation: 0,
    size: 200,
  },
}
