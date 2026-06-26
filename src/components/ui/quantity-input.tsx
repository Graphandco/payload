'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  'aria-label'?: string
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  className,
  'aria-label': ariaLabel = 'Quantité',
}: Props) {
  const canDecrease = value > min

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (max == null || value < max) {
      onChange(value + 1)
    }
  }

  return (
    <InputGroup className={cn('w-auto', className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          size="icon-sm"
          aria-label="Diminuer la quantité"
          aria-disabled={!canDecrease}
          tabIndex={canDecrease ? 0 : -1}
          className={cn(!canDecrease && 'pointer-events-none')}
          onClick={handleDecrease}
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="numeric"
        readOnly
        value={value}
        aria-label={ariaLabel}
        className="w-10 px-0 text-center"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label="Augmenter la quantité"
          disabled={max != null && value >= max}
          onClick={handleIncrease}
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
