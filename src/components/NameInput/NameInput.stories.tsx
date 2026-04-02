import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NameInput } from './NameInput'

const meta = {
  title: 'Components/NameInput',
  component: NameInput,
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
} satisfies Meta<typeof NameInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
    count: 0,
    onChange: () => {},
  },
}

export const WithNames: Story = {
  args: {
    value: '田中\n佐藤\n鈴木',
    count: 3,
    onChange: () => {},
    onShuffle: () => {},
  },
}

export const WithHonorific: Story = {
  args: {
    value: '田中\n佐藤\n鈴木',
    count: 3,
    withHonorific: true,
    onChange: () => {},
    onShuffle: () => {},
  },
}

export const Disabled: Story = {
  args: {
    value: '田中\n佐藤',
    count: 2,
    disabled: true,
    onChange: () => {},
    onShuffle: () => {},
  },
}

export const WithoutShuffle: Story = {
  args: {
    value: '田中\n佐藤',
    count: 2,
    onChange: () => {},
  },
}

export const Interactive: Story = {
  args: {
    value: '田中\n佐藤\n鈴木\n高橋\n渡辺',
    count: 5,
    withHonorific: true,
    onChange: () => {},
    onShuffle: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    const count = value.split('\n').filter((n) => n.trim()).length

    const handleShuffle = () => {
      const lines = value.split('\n').filter((line) => line.trim() !== '')
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[lines[i], lines[j]] = [lines[j], lines[i]]
      }
      setValue(lines.join('\n'))
    }

    return (
      <NameInput
        {...args}
        value={value}
        onChange={setValue}
        onShuffle={handleShuffle}
        count={count}
      />
    )
  },
}
