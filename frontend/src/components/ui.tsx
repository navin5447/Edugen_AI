import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white text-slate-950 shadow-lg shadow-cyan-950/10 hover:-translate-y-0.5 hover:shadow-xl',
        primary: 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5',
        secondary: 'border border-white/10 bg-white/8 text-white hover:bg-white/12',
        ghost: 'text-slate-200 hover:bg-white/10 hover:text-white',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-4 py-2',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
})
Button.displayName = 'Button'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-[1.5rem] border border-white/10 bg-white/8 shadow-2xl shadow-black/20 backdrop-blur-xl', className)}>{children}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/10', className)} />
}
