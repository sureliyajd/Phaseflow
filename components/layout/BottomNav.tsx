"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Today", path: "/today" },
  { icon: Plus, label: "Create", path: "/create", isMain: true },
  { icon: Clock, label: "Timesheet", path: "/timesheet" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-2">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.path}
                href={item.path}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-elevated transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "nav-item relative",
                isActive && "nav-item-active"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-primary-light rounded-xl -z-10" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

