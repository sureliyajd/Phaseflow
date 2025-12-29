"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/home";
    }
  }, [status]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  // Don't render register form if authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Just a few details to get you started");
      return;
    }

    if (!name.trim()) {
      setError("We'd love to know what to call you");
      return;
    }

    if (password.length < 6) {
      setError("Choose a password with at least 6 characters to keep your account safe");
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Your account is ready! Head over to login to get started.");
        setIsLoading(false);
      } else {
        // Use window.location for a full page reload to ensure session is loaded
        window.location.href = "/home";
      }
    } catch (error) {
      setError("Something went wrong on our end. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Logo variant="full" size="lg" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Begin something meaningful
      </h1>
      <p className="text-muted-foreground mb-8">
        Create your space for intentional growth
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Name
          </label>
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-soft w-full pl-12"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-soft w-full pl-12"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-soft w-full pl-12 pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 text-center mt-2">{error}</div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="xl"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          Sign in
        </Link>
      </p>

      {/* Encouragement */}
      <p className="text-muted-foreground mt-8 text-center text-sm">
        You're taking the first step. That takes courage.
      </p>
    </div>
  );
}

