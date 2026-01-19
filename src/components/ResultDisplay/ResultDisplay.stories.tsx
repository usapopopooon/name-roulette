import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ResultDisplay } from './ResultDisplay'

const meta = {
  title: 'Components/ResultDisplay',
  component: ResultDisplay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const WithResult: Story = {
  args: {
    result: '田中さん',
    onClose: fn(),
  },
}

export const LongName: Story = {
  args: {
    result: '山田太郎さん',
    onClose: fn(),
  },
}

export const WithChallengeButton: Story = {
  args: {
    result: '鈴木さん',
    onClose: fn(),
    onChallenge: fn(),
  },
}

export const WithContextMenu: Story = {
  args: {
    result: '鈴木さん',
    candidates: ['田中さん', '鈴木さん', '佐藤さん', '山田さん'],
    onClose: fn(),
    onChallenge: fn(),
    onShift: fn(),
  },
}

export const WithContextMenuAtEnd: Story = {
  args: {
    result: '山田さん',
    candidates: ['田中さん', '鈴木さん', '佐藤さん', '山田さん'],
    onClose: fn(),
    onShift: fn(),
  },
}

export const WithoutCloseButton: Story = {
  args: {
    result: '佐藤さん',
  },
}

export const NoResult: Story = {
  args: {
    result: null,
  },
}
