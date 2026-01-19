import type { Meta, StoryObj } from '@storybook/react'
import { ShareButton } from './ShareButton'

const meta = {
  title: 'Components/ShareButton',
  component: ShareButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onCopy: async () => {
      await new Promise((r) => setTimeout(r, 100))
      return true
    },
  },
}

export const CopyFails: Story = {
  args: {
    onCopy: async () => {
      await new Promise((r) => setTimeout(r, 100))
      return false
    },
  },
}
