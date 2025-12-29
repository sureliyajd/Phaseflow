"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles, Plus, Play, Calendar, ArrowRight, Loader2, Edit2, Archive, List } from "lucide-react";
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditPhase, setShowEditPhase] = useState(false);
  const [showArchivePhase, setShowArchivePhase] = useState(false);
  const [metrics, setMetrics] = useState<{
    streak: number;
    adherence: number | null;
    todayBlocks: { total: number; completed: number };
    phaseMotivation?: { why: string; outcome: string };
    hasRecentSkippedPattern?: boolean;
  } | null>(null);
  const previousStreakRef = useRef<number | null>(null);
  const [showStreakBreakReminder, setShowStreakBreakReminder] = useState(false);

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

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/dashboard/metrics");
      const data = await response.json();
      
      if (response.ok) {
        // Track streak changes for contextual reminders
        const previousStreak = previousStreakRef.current;
        if (previousStreak !== null && previousStreak > 0 && data.streak === 0) {
          // Streak just broke - check if we should show reminder (once per 24 hours)
          const reminderKey = `streak-break-reminder-${activePhase?.id}`;
          const lastShown = localStorage.getItem(reminderKey);
          const now = Date.now();
          if (!lastShown || now - parseInt(lastShown, 10) > 24 * 60 * 60 * 1000) {
            localStorage.setItem(reminderKey, String(now));
            setShowStreakBreakReminder(true);
          } else {
            setShowStreakBreakReminder(false);
          }
        } else if (data.streak > 0) {
          // Streak is active, hide reminder
          setShowStreakBreakReminder(false);
        }
        
        previousStreakRef.current = data.streak;
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    fetchActivePhase();
    fetchMetrics();
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
          <div className="px-4 sm:px-5 pt-6 sm:pt-8 pb-4">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">{getGreeting()},</p>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {session?.user?.name || "Friend"}
              </h1>
            </div>
          </div>

          <div className="mx-4 sm:mx-5 mt-6 sm:mt-8">
            <div className="card-soft text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-primary-light flex items-center justify-center mb-4 sm:mb-6">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Ready to Begin?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-xs mx-auto px-4">
                A phase is your container for intentional living. Set it up
                in a way that feels right for you.
              </p>
              <div className="flex flex-col gap-2 sm:gap-3 px-4">
              <Link href="/create-phase">
                  <Button size="xl" className="w-full text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Phase
                </Button>
              </Link>
                <Link href="/phases">
                  <Button variant="outline" className="w-full text-sm sm:text-base">
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    View All Phases
                  </Button>
                </Link>
              </div>
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
        <div className="px-4 sm:px-5 pt-6 sm:pt-8 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs sm:text-sm">{getGreeting()},</p>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                {session?.user?.name || "Friend"}
              </h1>
            </div>
            {metrics && metrics.streak > 0 && (
              <div className="streak-badge flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  {metrics.streak} {metrics.streak === 1 ? "day" : "days"} going strong
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Phase Card */}
        <div className="mx-4 sm:mx-5 mb-4">
          <div className="card-soft">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="flex-shrink-0">
                <ProgressRing
                  progress={Math.round((activePhase.currentDay / activePhase.durationDays) * 100)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Current Phase</p>
                <h2 className="font-bold text-foreground text-lg sm:text-xl mt-0.5 break-words">
                  {activePhase.name}
                </h2>
                <p className="text-xs sm:text-sm text-primary font-medium mt-1">
                  Day {activePhase.currentDay} of {activePhase.durationDays}
                  {activePhase.currentDay === 1 && " · Just started"}
                </p>
              </div>
            </div>
            
            {/* Manage Phase Section */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2 sm:mb-3">Manage Phase</p>
              <div className="flex gap-1.5 sm:gap-2">
                <Link href="/phases" className="flex-1 min-w-0">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">All Phases</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1 justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 min-w-0"
                  onClick={() => setShowEditPhase(true)}
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 text-muted-foreground hover:text-destructive min-w-0"
                  onClick={() => setShowArchivePhase(true)}
                >
                  <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Archive</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Phase Modal */}
        {showEditPhase && (
          <EditPhaseModal
            phase={activePhase}
            onClose={() => setShowEditPhase(false)}
            onSave={(updatedPhase) => {
              setActivePhase({ ...activePhase, ...updatedPhase });
              setShowEditPhase(false);
              // Refresh the phase data and metrics
              fetchActivePhase();
              fetchMetrics();
            }}
          />
        )}

        {/* Archive Phase Modal */}
        {showArchivePhase && (
          <ArchivePhaseModal
            phase={activePhase}
            onClose={() => setShowArchivePhase(false)}
            onConfirm={() => {
              setActivePhase(null);
              setShowArchivePhase(false);
              // Refresh to update state
              window.location.href = "/";
            }}
          />
        )}

        {/* Contextual Reminders */}
        {metrics && metrics.phaseMotivation && (
          <>
            {/* Streak Break Reminder */}
            {showStreakBreakReminder && metrics.streak === 0 && (
              <div className="mx-4 sm:mx-5 mt-4 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-sm text-foreground">
                  This phase started because {metrics.phaseMotivation.why.toLowerCase()}. One day doesn't undo that.
                </p>
              </div>
            )}
            {/* Multiple Recent Days Skipped Reminder */}
            {metrics.hasRecentSkippedPattern && (
              <div className="mx-4 sm:mx-5 mt-4 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-sm text-foreground">
                  You've had a few challenging days. This phase is about {metrics.phaseMotivation.why.toLowerCase()}. 
                  Consider adjusting your routine if it feels too much right now — your intention still matters.
                </p>
              </div>
            )}
          </>
        )}

        {/* Today's Progress */}
        <div className="mx-4 sm:mx-5 mt-4 card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Today</h3>
            <Link
              href="/today"
              className="text-xs sm:text-sm text-primary font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
          {metrics && metrics.todayBlocks.total > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (metrics.todayBlocks.completed / metrics.todayBlocks.total) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {metrics.todayBlocks.completed}/{metrics.todayBlocks.total}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.todayBlocks.completed === metrics.todayBlocks.total
                  ? "You showed up today. Well done."
                  : `${metrics.todayBlocks.total - metrics.todayBlocks.completed} ${metrics.todayBlocks.total - metrics.todayBlocks.completed === 1 ? "block" : "blocks"} to go — no rush`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your schedule is open today. Take a breath.
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="mx-4 sm:mx-5 mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="card-soft text-center p-3 sm:p-4">
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              {metrics?.adherence !== null && metrics?.adherence !== undefined
                ? `${metrics.adherence}%`
                : "—"}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {metrics?.adherence !== null && metrics?.adherence !== undefined
                ? "Days you met your goals"
                : "Complete routines to see trends"}
            </p>
          </div>
          <div className="card-soft text-center p-3 sm:p-4">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {metrics?.streak || 0}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {metrics?.streak === 1 ? "Day of consistency" : "Days of consistency"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4 sm:mx-5 mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">
            What feels right now?
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link href="/today">
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" />
                <span className="truncate">Begin my day</span>
              </Button>
            </Link>
            <Link href="/timesheet">
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-accent flex-shrink-0" />
                <span className="truncate">Log something</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mx-4 sm:mx-5 mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
          <p className="text-center text-foreground text-sm sm:text-base">
            Progress isn't always visible. Trust the process.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
