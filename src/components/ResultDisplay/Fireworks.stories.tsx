import type { Meta, StoryObj } from '@storybook/react'
import { Fireworks } from './Fireworks'

const meta = {
  title: 'Components/ResultDisplay/Fireworks',
  component: Fireworks,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Fireworks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
