import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@workspace/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-48 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,.18)] hover:bg-primary/88 hover:shadow-[0_3px_8px_rgba(0,0,0,.16)]",

        outline:
          "border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:border-foreground/25 hover:bg-accent",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/75",

        soft: "bg-primary/10 text-primary hover:bg-primary/16 dark:text-foreground",

        link: "h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline",

        ghost: "text-foreground/75 hover:bg-accent hover:text-foreground",

        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/88",
      },

      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-10 p-0",
        "icon-sm": "size-8 rounded-md p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
