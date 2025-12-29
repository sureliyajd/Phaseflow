"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Target, Heart, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, addDays } from "date-fns";

const durationOptions = [
  {
    value: 30,
    label: "30 days",
    description: "Perfect for building a new habit",
  },
  {
    value: 60,
    label: "60 days",
    description: "Deeper transformation",
  },
  {
    value: 90,
    label: "90 days",
    description: "Complete lifestyle shift",
  },
];

export default function CreatePhase() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [whyStarting, setWhyStarting] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Phase name is required");
      return;
    }

    // Validate duration
    let finalDuration = duration;
    if (useCustomDuration) {
      const customValue = parseInt(customDuration);
      if (!customDuration || isNaN(customValue) || customValue < 1) {
        setError("Please enter a valid duration (at least 1 day)");
        return;
      }
      finalDuration = customValue;
    }

    // Validate start date
    if (!startDate || isNaN(new Date(startDate).getTime())) {
      setError("Please select a valid start date");
      return;
    }

    if (!whyStarting.trim()) {
      setError("Please tell us why you're starting this phase");
      return;
    }

    if (!expectedOutcome.trim()) {
      setError("Please describe your expected outcome");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/phases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          durationDays: finalDuration,
          startDate,
          why: whyStarting.trim(),
          outcome: expectedOutcome.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create phase");
        setIsLoading(false);
        return;
      }

      // Redirect to routine builder for onboarding
    router.push("/routine-builder");
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Calculate end date safely
  const getEndDate = () => {
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return null;
      const finalDuration = useCustomDuration && customDuration 
        ? parseInt(customDuration) || duration 
        : duration;
      return addDays(start, finalDuration - 1);
    } catch {
      return null;
    }
  };

  const endDate = getEndDate();

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Create Phase
              </h1>
              <p className="text-sm text-muted-foreground">
                Start your focused journey
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Phase Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Phase Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 30-Day Focus Reset"
              className="input-soft w-full text-lg"
              required
            />
          </div>

          {/* Duration Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Duration
            </label>
            <div className="space-y-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setDuration(option.value);
                    setUseCustomDuration(false);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    !useCustomDuration && duration === option.value
                      ? "bg-primary-light border-primary/30"
                      : "bg-card border-border/50 hover:border-primary/20"
                  }`}
                >
                  <p className="font-semibold text-foreground">
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </button>
              ))}
              
              {/* Custom Duration Option */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUseCustomDuration(true)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    useCustomDuration
                      ? "bg-primary-light border-primary/30"
                      : "bg-card border-border/50 hover:border-primary/20"
                  }`}
                >
                  <p className="font-semibold text-foreground">
                    Custom Duration
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Set your own duration in days
                  </p>
                </button>
                {useCustomDuration && (
                  <div className="pl-4">
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
                          setCustomDuration(value);
                        }
                      }}
                      placeholder="Enter number of days"
                      min="1"
                      className="input-soft w-full"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const value = e.target.value;
                // Only update if it's a valid date string
                if (value && !isNaN(new Date(value).getTime())) {
                  setStartDate(value);
                }
              }}
              onBlur={(e) => {
                // Validate on blur and reset if invalid
                const value = e.target.value;
                if (value && isNaN(new Date(value).getTime())) {
                  setStartDate(format(new Date(), "yyyy-MM-dd"));
                }
              }}
              className="input-soft w-full"
              required
            />
            {endDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Ends on {format(endDate, "MMMM d, yyyy")}
            </p>
            )}
          </div>

          {/* Why Starting */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Why are you starting this phase? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={whyStarting}
              onChange={(e) => setWhyStarting(e.target.value)}
              placeholder="What's motivating you right now?"
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Target className="w-4 h-4" />
              What outcome do you hope for? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="How will you feel at the end?"
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          {/* Encouragement Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  You're taking a meaningful step
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This phase is about progress, not perfection. Be kind to
                  yourself along the way.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Phase...
                </>
              ) : (
                "Create Phase"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

