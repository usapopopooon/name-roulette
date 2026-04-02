import type { Meta, StoryObj } from '@storybook/react'
import { ActionButton } from './ActionButton'

const meta = {
  title: 'Components/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent'],
    },
  },
} satisfies Meta<typeof ActionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'スタート！',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'リセット',
    variant: 'secondary',
  },
}

export const PrimaryDisabled: Story = {
  args: {
    children: '回転中...',
    variant: 'primary',
    disabled: true,
  },
}

export const SecondaryDisabled: Story = {
  args: {
    children: 'リセット',
    variant: 'secondary',
    disabled: true,
  },
}

export const SmallSecondary: Story = {
  args: {
    children: '🔀 シャッフル',
    variant: 'secondary',
    size: 'sm',
  },
}

export const SmallSecondaryDisabled: Story = {
  args: {
    children: '🔀 シャッフル',
    variant: 'secondary',
    size: 'sm',
    disabled: true,
  },
}

export const Accent: Story = {
  args: {
    children: '🔀 シャッフル',
    variant: 'accent',
    size: 'sm',
  },
}

export const AccentDisabled: Story = {
  args: {
    children: '🔀 シャッフル',
    variant: 'accent',
    size: 'sm',
    disabled: true,
  },
}
