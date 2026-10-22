import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** shadcn/ui-style button, restyled to the "paper & ink" system (8px radius, 2px ink outline, hard shadow). */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn border-2 border-ink font-sans font-bold transition-transform duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none',
  {
    variants: {
      variant: {
        pink: 'bg-pink text-card shadow-hard hover:-translate-x-px hover:-translate-y-px',
        outline: 'bg-card text-ink shadow-hard hover:-translate-x-px hover:-translate-y-px',
        ink: 'bg-ink text-paper shadow-hard hover:-translate-x-px hover:-translate-y-px',
        yellow: 'bg-yellow text-ink shadow-hard hover:-translate-x-px hover:-translate-y-px',
        ghost: 'border-transparent bg-transparent text-ink hover:bg-paper2',
        disabled: 'border-soft bg-paper2 text-soft',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-[22px] py-3 text-[15px]',
        lg: 'px-8 py-4 text-lg shadow-hard-md',
      },
    },
    defaultVariants: { variant: 'pink', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
