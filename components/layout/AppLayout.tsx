import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { UserMenu } from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with User Menu */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-5 py-3 flex items-center justify-end">
          <UserMenu />
        </div>
      </header>
      <main className="pb-24 md:pb-8 md:pl-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

