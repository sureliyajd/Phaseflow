"use client";

import { useEffect, useState } from "react";

interface DayData {
  day: string;
  value: number;
  maxValue: number;
}

interface WeeklyChartProps {
  data: DayData[];
  title: string;
}

export function WeeklyChart({ data, title }: WeeklyChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map((d) => d.maxValue));

  return (
    <div
      className="card-soft transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">
        {title}
      </h3>

      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isToday = index === data.length - 1;

          return (
            <div
              key={item.day}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="w-full h-24 flex items-end justify-center">
                <div
                  className="w-full max-w-[28px] rounded-t-lg transition-all duration-500"
                  style={{
                    height: isVisible ? `${height}%` : "0%",
                    backgroundColor: isToday
                      ? "var(--color-primary)"
                      : "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    transitionDelay: `${300 + index * 50}ms`,
                  }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{
                  color: isToday
                    ? "var(--color-primary)"
                    : "var(--color-muted-foreground)",
                }}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
