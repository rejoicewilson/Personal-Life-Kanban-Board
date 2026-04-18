import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors', {
  variants: {
    variant: {
      default: 'bg-secondary text-secondary-foreground',
      outline: 'border border-border text-foreground',
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
      danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
      info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
      violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
