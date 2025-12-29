"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, User, Mail, FileText, Globe, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (response.ok && data.user) {
        setProfile(data.user);
        setName(data.user.name || "");
        setBio(data.user.bio || "");
        setTimezone(data.user.timezone || "");
        setAvatarUrl(data.user.avatarUrl || "");
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          timezone: timezone.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Update local state
      setProfile(data.user);
      
      // Refresh session to get updated name
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Make Phaseflow feel like home
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name */}
            <div className="card-soft p-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-soft w-full"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div className="card-soft p-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="input-soft w-full opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is tied to your account
              </p>
            </div>

            {/* Bio */}
            <div className="card-soft p-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A few words about you (optional)"
                rows={3}
                className="input-soft w-full resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bio.length}/200 characters
              </p>
            </div>

            {/* Timezone */}
            <div className="card-soft p-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., America/New_York, Europe/London"
                className="input-soft w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Helps us show times in your local zone
              </p>
            </div>

            {/* Avatar URL (for future use) */}
            <div className="card-soft p-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="input-soft w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a picture URL if you'd like
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

