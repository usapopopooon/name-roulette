import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a2e' }],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checked: Story = {
  args: {
    label: '名前に「さん」をつける',
    checked: true,
    onChange: () => {},
  },
}

export const Unchecked: Story = {
  args: {
    label: '名前に「さん」をつける',
    checked: false,
    onChange: () => {},
  },
}

export const Disabled: Story = {
  args: {
    label: '名前に「さん」をつける',
    checked: true,
    disabled: true,
    onChange: () => {},
  },
}

export const Interactive: Story = {
  args: {
    label: '名前に「さん」をつける',
    checked: true,
    onChange: () => {},
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(args.checked)
    return <Checkbox {...args} checked={checked} onChange={setChecked} />
  },
}
