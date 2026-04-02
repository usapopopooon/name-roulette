import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const ExcludeConfirm: Story = {
  args: {
    message: '前回の当選者「田中さん」を\n除外しますか？',
    onYes: fn(),
    onNo: fn(),
  },
}

export const ChallengeConfirm: Story = {
  args: {
    message: '「佐藤さん」の当選確率を\n下げますか？',
    onYes: fn(),
    onNo: fn(),
  },
}

export const ShortMessage: Story = {
  args: {
    message: '本当に削除しますか？',
    onYes: fn(),
    onNo: fn(),
  },
}
