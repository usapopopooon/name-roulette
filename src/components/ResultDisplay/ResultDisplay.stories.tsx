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
    resultId: 'tanaka-1',
    resultLabel: '田中さん',
    onClose: fn(),
  },
}

export const LongName: Story = {
  args: {
    resultId: 'yamada-1',
    resultLabel: '山田太郎さん',
    onClose: fn(),
  },
}

export const WithChallengeButton: Story = {
  args: {
    resultId: 'suzuki-1',
    resultLabel: '鈴木さん',
    onClose: fn(),
    onChallenge: fn(),
  },
}

export const WithContextMenu: Story = {
  args: {
    resultId: 'suzuki-1',
    resultLabel: '鈴木さん',
    candidates: [
      { id: 'tanaka-1', label: '田中さん' },
      { id: 'suzuki-1', label: '鈴木さん' },
      { id: 'sato-1', label: '佐藤さん' },
      { id: 'yamada-1', label: '山田さん' },
    ],
    onClose: fn(),
    onChallenge: fn(),
    onShift: fn(),
  },
}

export const WithContextMenuAtEnd: Story = {
  args: {
    resultId: 'yamada-1',
    resultLabel: '山田さん',
    candidates: [
      { id: 'tanaka-1', label: '田中さん' },
      { id: 'suzuki-1', label: '鈴木さん' },
      { id: 'sato-1', label: '佐藤さん' },
      { id: 'yamada-1', label: '山田さん' },
    ],
    onClose: fn(),
    onShift: fn(),
  },
}

export const WithoutCloseButton: Story = {
  args: {
    resultId: 'sato-1',
    resultLabel: '佐藤さん',
  },
}

export const NoResult: Story = {
  args: {
    resultId: null,
    resultLabel: null,
  },
}
