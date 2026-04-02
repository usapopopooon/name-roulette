import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ManualDialog } from './ManualDialog'

const meta = {
  title: 'Components/ManualDialog',
  component: ManualDialog,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ManualDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClose: fn(),
  },
}
