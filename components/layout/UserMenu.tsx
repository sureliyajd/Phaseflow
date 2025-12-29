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
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          {getUserInitials()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {session.user.email}
          </p>
        </div>
      </div>

      {/* Profile Button */}
      <Link href="/profile">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          title="Profile"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </Link>

      {/* Logout Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}

