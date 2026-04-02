import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ContextMenu } from './ContextMenu'

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    x: 100,
    y: 100,
    items: [
      { label: '「田中さん」の確率を倍にする', onClick: fn() },
      { label: '「田中さん」の確率を半分にする', onClick: fn() },
      { label: '「田中さん」を削除', onClick: fn(), danger: true },
    ],
    onClose: fn(),
  },
}

export const ShortLabels: Story = {
  args: {
    x: 100,
    y: 100,
    items: [
      { label: '確率を倍にする', onClick: fn() },
      { label: '確率を半分にする', onClick: fn() },
      { label: '削除', onClick: fn(), danger: true },
    ],
    onClose: fn(),
  },
}
