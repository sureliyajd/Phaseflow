import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-8 md:pl-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

