"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "accent" | "calm" | "ghost" | "link" | "soft";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variantStyles = {
      default: "bg-primary text-primary-foreground shadow-soft hover:opacity-90",
      destructive: "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90",
      outline: "border border-border bg-card shadow-soft hover:bg-muted",
      secondary: "bg-secondary text-secondary-foreground shadow-soft hover:opacity-90",
      accent: "bg-accent text-accent-foreground shadow-soft hover:opacity-90",
      calm: "bg-calm text-calm-foreground shadow-soft hover:opacity-90",
      ghost: "hover:bg-muted hover:text-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      soft: "bg-primary-light text-primary hover:opacity-90",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2 rounded-xl text-sm",
      sm: "h-9 rounded-lg px-4 text-xs",
      lg: "h-12 rounded-xl px-8 text-base",
      xl: "h-14 rounded-2xl px-10 text-lg",
      icon: "h-11 w-11 rounded-xl",
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
