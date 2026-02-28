"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-100 border-b-4 active:border-b-2 active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#58CC02] border-b-[#45A002] text-white hover:bg-[#61D800] active:bg-[#58CC02]",
        primary:
          "bg-[#1CB0F6] border-b-[#1899D6] text-white hover:bg-[#40BEF7] active:bg-[#1CB0F6]",
        secondary:
          "bg-white border-b-gray-300 text-gray-700 hover:bg-gray-50 active:bg-white border-2 border-gray-300",
        danger:
          "bg-[#E53838] border-b-[#C52F2F] text-white hover:bg-[#F04848] active:bg-[#E53838]",
        ghost:
          "bg-transparent border-b-0 active:border-b-0 active:translate-y-0 text-gray-500 hover:bg-gray-100",
        outline:
          "bg-white border-2 border-gray-300 border-b-4 border-b-gray-300 text-gray-700 hover:bg-gray-50 active:bg-white",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
