import * as React from 'react'
// import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from 'class-variance-authority'
import './badge.css'

import { cn } from '@/lib/utils'

const badgeVariants = cva('yp-badge', {
  variants: {
    variant: {
      default: 'yp-badge-default',
      secondary: 'yp-badge-secondary',
      destructive: 'yp-badge-destructive',
      outline: 'yp-badge-outline',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  // const Comp = asChild ? Slot : "span"

  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
