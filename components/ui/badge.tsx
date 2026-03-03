import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-white/10 text-white border-white/20",
        secondary: "border-transparent bg-neutral-800 text-neutral-300",
        success: "border-transparent bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
        warning: "border-transparent bg-amber-600/20 text-amber-300 border-amber-500/30",
        danger: "border-transparent bg-red-600/20 text-red-300 border-red-500/30",
        outline: "border-neutral-600 text-neutral-400",
        active: "border-transparent bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        persona: "border-transparent bg-white/10 text-white border-white/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
