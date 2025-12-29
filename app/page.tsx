"use client";

import { useEffect, useState } from "react";
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
  } | null>(null);

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
          <div className="px-5 pt-8 pb-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-foreground">
                {session?.user?.name || "Friend"}
              </h1>
            </div>
          </div>

          <div className="mx-5 mt-8">
            <div className="card-soft text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-light flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Ready to Begin?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                A phase is your container for intentional living. Set it up
                in a way that feels right for you.
              </p>
              <div className="flex flex-col gap-3">
              <Link href="/create-phase">
                  <Button size="xl" className="w-full">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Phase
                </Button>
              </Link>
                <Link href="/phases">
                  <Button variant="outline" className="w-full">
                    <List className="w-4 h-4 mr-2" />
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
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-foreground">
                {session?.user?.name || "Friend"}
              </h1>
            </div>
            {metrics && metrics.streak > 0 && (
              <div className="streak-badge">
                <Sparkles className="w-4 h-4" />
                <span>
                  {metrics.streak} {metrics.streak === 1 ? "day" : "days"} going strong
                </span>
              </div>
            )}
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
                {activePhase.currentDay === 1 && " · Just started"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/phases">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="View All Phases"
                >
                  <List className="w-4 h-4" />
                </Button>
              </Link>
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
        <div className="mx-5 mt-4 grid grid-cols-2 gap-4">
          <div className="card-soft text-center">
            <p className="text-3xl font-bold text-primary">
              {metrics?.adherence !== null && metrics?.adherence !== undefined
                ? `${metrics.adherence}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.adherence !== null && metrics?.adherence !== undefined
                ? "Days you met your goals"
                : "Complete routines to see trends"}
            </p>
          </div>
          <div className="card-soft text-center">
            <p className="text-3xl font-bold text-foreground">
              {metrics?.streak || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.streak === 1 ? "Day of consistency" : "Days of consistency"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-5 mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            What feels right now?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/today">
              <Button variant="outline" className="w-full justify-start">
                <Play className="w-4 h-4 mr-2 text-primary" />
                Begin my day
              </Button>
            </Link>
            <Link href="/timesheet">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2 text-accent" />
                Log something
              </Button>
            </Link>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mx-5 mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
          <p className="text-center text-foreground">
            Progress isn't always visible. Trust the process.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
