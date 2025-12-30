import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { UserMenu } from "./UserMenu";
import { Logo } from "@/components/ui/Logo";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and User Menu */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0">
          <div className="flex-shrink-0 min-w-0">
            <Logo variant="full" size="sm" className="sm:hidden" />
            <Logo variant="full" size="md" className="hidden sm:block" />
          </div>
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="pb-28 md:pb-8 md:pl-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

