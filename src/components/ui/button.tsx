import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer select-none transition-[background-color,color,border-color,transform] duration-150 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover font-semibold",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent text-foreground hover:bg-elevated",
        secondary: "border border-border bg-elevated text-foreground hover:border-faint/60",
        ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0",
      },
      size: {
        default: "h-9 rounded-md px-3.5 text-[13px] [&_svg]:size-4",
        sm: "h-8 rounded-md px-3 text-meta [&_svg]:size-3.5",
        lg: "h-11 rounded-[10px] px-6 text-[15px] [&_svg]:size-4",
        icon: "size-9 rounded-md [&_svg]:size-4",
        "icon-lg": "size-11 rounded-[10px] [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
