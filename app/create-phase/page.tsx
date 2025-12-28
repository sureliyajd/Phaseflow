"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Target, Heart, Sparkles } from "lucide-react";
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
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [whyStarting, setWhyStarting] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      // In real app, show toast error
      return;
    }

    // In real app, create phase via API
    router.push("/routine-builder");
  };

  const endDate = addDays(new Date(startDate), duration - 1);

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
          {/* Phase Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Phase Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 30-Day Focus Reset"
              className="input-soft w-full text-lg"
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
                  onClick={() => setDuration(option.value)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    duration === option.value
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
              onChange={(e) => setStartDate(e.target.value)}
              className="input-soft w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Ends on {format(endDate, "MMMM d, yyyy")}
            </p>
          </div>

          {/* Why Starting */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Why are you starting this phase?
            </label>
            <textarea
              value={whyStarting}
              onChange={(e) => setWhyStarting(e.target.value)}
              placeholder="What's motivating you right now? (optional)"
              rows={3}
              className="input-soft w-full resize-none"
            />
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Target className="w-4 h-4" />
              What outcome do you hope for?
            </label>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="How will you feel at the end? (optional)"
              rows={3}
              className="input-soft w-full resize-none"
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
            <Button type="submit" size="xl" className="w-full">
              Create Phase
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

