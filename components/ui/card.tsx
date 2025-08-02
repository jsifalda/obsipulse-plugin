import * as React from 'react'
import './card.css'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('yp-card', className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('yp-card-header', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('yp-card-title', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('yp-card-description', className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-action" className={cn('yp-card-action', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('yp-card-content', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('yp-card-footer', className)} {...props} />
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
