import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'hover:bg-primary/80 bg-primary text-primary-foreground border-transparent',
        secondary:
          'hover:bg-secondary/80 bg-secondary text-secondary-foreground border-transparent',
        destructive:
          'hover:bg-destructive/80 bg-destructive text-destructive-foreground border-transparent',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
