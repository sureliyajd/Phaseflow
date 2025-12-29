"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (!session?.user) {
    return null;
  }

  // Get user initials from name or email
  const getUserInitials = () => {
    if (session.user?.name) {
      const names = session.user.name.trim().split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const displayName = session.user?.name || session.user?.email?.split("@")[0] || "User";

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* User Info - Hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <div
          className="w-8 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          {getUserInitials()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {session.user.email}
          </p>
        </div>
      </div>

      {/* Mobile: Just avatar icon, Desktop: Full user info + buttons */}
      <div className="sm:hidden">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          {getUserInitials()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Profile/Settings Button */}
        <Link href="/profile">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-auto md:w-auto md:px-3 md:gap-2"
            title="Profile & Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Profile</span>
          </Button>
        </Link>

        {/* Logout Button - More spacing on mobile to prevent accidental clicks */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-auto md:w-auto md:px-3 md:gap-2 border-border/60"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </div>
  );
}

