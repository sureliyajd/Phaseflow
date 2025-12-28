"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, authenticate via API
    router.push("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <span className="text-2xl font-bold text-white">P</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
      <p className="text-muted-foreground mb-8">
        Continue your journey with Phaseflow
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
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
              placeholder="••••••••"
              className="input-soft w-full pl-12 pr-12"
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

        {/* Submit Button */}
        <Button type="submit" size="xl" className="w-full mt-6">
          Sign in
        </Button>
      </form>

      {/* Register Link */}
      <p className="text-muted-foreground mt-6">
        New to Phaseflow?{" "}
        <Link
          href="/register"
          className="font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          Create an account
        </Link>
      </p>

      {/* Demo Account Card */}
      <div
        className="mt-6 p-4 rounded-2xl w-full max-w-sm"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-accent) 20%, transparent)",
        }}
      >
        <p className="font-semibold text-foreground">Demo Account</p>
        <p className="text-sm text-muted-foreground mt-1">
          Email: <span className="font-mono">demo@phaseflow.app</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Password: <span className="font-mono">demo123</span>
        </p>
      </div>

      {/* Encouragement */}
      <p className="text-muted-foreground mt-8 text-center text-sm">
        Every day is a fresh start. You've got this.
      </p>
    </div>
  );
}

