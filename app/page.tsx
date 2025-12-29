"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to /home
    if (status === "authenticated" && session) {
      router.replace("/home");
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, show nothing (redirecting)
  if (status === "authenticated") {
    return null;
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
