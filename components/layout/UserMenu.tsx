"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
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

  // Get user initials or first letter of email
  const getUserInitials = () => {
    if (session.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

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
            {session.user.email?.split("@")[0] || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {session.user.email}
          </p>
        </div>
      </div>

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

