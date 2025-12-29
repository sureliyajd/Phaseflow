"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, Play, Calendar, ArrowRight, Loader2, Edit2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { AppLayout } from "@/components/layout/AppLayout";
import { EditPhaseModal } from "@/components/phases/EditPhaseModal";
import { ArchivePhaseModal } from "@/components/phases/ArchivePhaseModal";
import { format } from "date-fns";

interface Phase {
  id: string;
  name: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  why: string;
  outcome: string;
  isActive: boolean;
  currentDay: number;
}

const todayBlocks = [
  { id: "1", title: "Morning Meditation", completed: true },
  { id: "2", title: "Deep Work Session", completed: true },
  { id: "3", title: "Exercise", completed: false },
];
const completedBlocks = todayBlocks.filter((b) => b.completed).length;
const streak = 12;
const adherence = 85;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditPhase, setShowEditPhase] = useState(false);
  const [showArchivePhase, setShowArchivePhase] = useState(false);

  useEffect(() => {
    const fetchActivePhase = async () => {
      try {
        const response = await fetch("/api/phases/active");
        const data = await response.json();
        
        if (response.ok && data.phase) {
          setActivePhase(data.phase);
        } else {
          setActivePhase(null);
        }
      } catch (error) {
        console.error("Error fetching active phase:", error);
        setActivePhase(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePhase();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      </AppLayout>
    );
  }

  // No active phase - prompt to create
  if (!activePhase) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8">
          <div className="px-5 pt-8 pb-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-foreground">Friend</h1>
            </div>
          </div>

          <div className="mx-5 mt-8">
            <div className="card-soft text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-light flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Start Your First Phase
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                A phase is a focused period where you commit to your daily
                routine. No pressure, just progress.
              </p>
              <Link href="/create-phase">
                <Button size="xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Phase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active phase dashboard
  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-foreground">Friend</h1>
            </div>
            <div className="streak-badge">
              <Sparkles className="w-4 h-4" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </div>

        {/* Phase Card */}
        <div className="mx-5 card-soft">
          <div className="flex items-center gap-4">
            <ProgressRing
              progress={Math.round((activePhase.currentDay / activePhase.durationDays) * 100)}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <h2 className="font-bold text-foreground text-lg">
                {activePhase.name}
              </h2>
              <p className="text-sm text-primary font-medium mt-1">
                Day {activePhase.currentDay} of {activePhase.durationDays}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowEditPhase(true)}
                title="Edit Phase"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => setShowArchivePhase(true)}
                title="Archive Phase"
              >
                <Archive className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Edit Phase Modal */}
        {showEditPhase && (
          <EditPhaseModal
            phase={activePhase}
            onClose={() => setShowEditPhase(false)}
            onSave={(updatedPhase) => {
              // UI only - no backend yet
              setActivePhase({ ...activePhase, ...updatedPhase });
              setShowEditPhase(false);
            }}
          />
        )}

        {/* Archive Phase Modal */}
        {showArchivePhase && (
          <ArchivePhaseModal
            phase={activePhase}
            onClose={() => setShowArchivePhase(false)}
            onConfirm={() => {
              // UI only - no backend yet
              setActivePhase(null);
              setShowArchivePhase(false);
            }}
          />
        )}

        {/* Today's Progress */}
        <div className="mx-5 mt-4 card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Today</h3>
            <Link
              href="/today"
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width:
                      todayBlocks.length > 0
                        ? `${(completedBlocks / todayBlocks.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">
              {completedBlocks}/{todayBlocks.length}
            </span>
          </div>
          {todayBlocks.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              No blocks scheduled for today.{" "}
              <Link href="/routine-builder" className="text-primary">
                Add some?
              </Link>
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="mx-5 mt-4 grid grid-cols-2 gap-4">
          <div className="card-soft text-center">
            <p className="text-3xl font-bold text-primary">{adherence}%</p>
            <p className="text-xs text-muted-foreground mt-1">Adherence Rate</p>
          </div>
          <div className="card-soft text-center">
            <p className="text-3xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-5 mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/today">
              <Button variant="outline" className="w-full justify-start">
                <Play className="w-4 h-4 mr-2 text-primary" />
                Start Today
              </Button>
            </Link>
            <Link href="/timesheet">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2 text-accent" />
                Log Activity
              </Button>
            </Link>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mx-5 mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
          <p className="text-center text-foreground">
            Every small step counts. You're doing great.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
