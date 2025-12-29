"use client";

import { Clock, CheckCircle2, Flame, Target, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

type IconName = "Clock" | "CheckCircle2" | "Flame" | "Target";

const iconMap: Record<IconName, LucideIcon> = {
  Clock,
  CheckCircle2,
  Flame,
  Target,
};

interface StatCardProps {
  icon: IconName;
  label: string;
  value: string;
  subtext?: string;
  color: "primary" | "accent" | "calm" | "secondary";
  delay?: number;
}

const colorStyles = {
  primary: {
    background: "var(--color-primary-light)",
    color: "var(--color-primary)",
  },
  accent: {
    background: "color-mix(in srgb, var(--color-accent) 30%, transparent)",
    color: "var(--color-accent-foreground)",
  },
  calm: {
    background: "color-mix(in srgb, var(--color-calm) 30%, transparent)",
    color: "var(--color-calm-foreground)",
  },
  secondary: {
    background: "var(--color-secondary)",
    color: "var(--color-secondary-foreground)",
  },
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
  delay = 0,
}: StatCardProps) {
  const Icon = iconMap[icon];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="card-soft transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: colorStyles[color].background,
            color: colorStyles[color].color,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}
