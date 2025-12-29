"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Archive,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, parseISO, isToday, isPast, isFuture } from "date-fns";
import { EditPhaseModal } from "@/components/phases/EditPhaseModal";
import { ArchivePhaseModal } from "@/components/phases/ArchivePhaseModal";

interface Phase {
  id: string;
  name: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  currentDay: number;
}

interface DayBlock {
  id: string;
  title: string;
  note: string | null;
  startTime: string;
  endTime: string;
  category: string | null;
}

interface PhaseDay {
  date: string;
  dateObj: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  blocks: DayBlock[];
}

export default function PhaseBoard() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [days, setDays] = useState<PhaseDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showEditPhase, setShowEditPhase] = useState(false);
  const [showArchivePhase, setShowArchivePhase] = useState(false);

  useEffect(() => {
    const fetchPhaseData = async () => {
      try {
        // Get active phase
        const phaseResponse = await fetch("/api/phases/active");
        const phaseData = await phaseResponse.json();

        if (!phaseResponse.ok || !phaseData.phase) {
          router.push("/");
          return;
        }

        const activePhase = phaseData.phase;

        // Get phase days with blocks
        const daysResponse = await fetch(`/api/phases/${activePhase.id}/days`);
        const daysData = await daysResponse.json();

        if (daysResponse.ok) {
          setPhase(daysData.phase);
          setDays(daysData.days);
          
          // Auto-expand today
          const today = daysData.days.find((d: PhaseDay) => d.isToday);
          if (today) {
            setExpandedDays(new Set([today.date]));
          }
        }
      } catch (error) {
        console.error("Error fetching phase data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhaseData();
  }, [router]);

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading phase board...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!phase) {
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{phase.name}</h1>
              <p className="text-sm text-muted-foreground">
                Day {phase.currentDay} of {phase.durationDays}
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

          {/* Phase Info */}
          <div className="card-soft p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium text-foreground">
                  {format(parseISO(phase.startDate), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium text-foreground">
                  {format(parseISO(phase.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-5 space-y-2">
          {days.map((day) => {
            const isExpanded = expandedDays.has(day.date);
            const hasBlocks = day.blocks.length > 0;

            return (
              <div
                key={day.date}
                className={`card-soft transition-all ${
                  day.isToday
                    ? "border-2 border-primary"
                    : day.isPast
                    ? "opacity-75"
                    : ""
                }`}
              >
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day.date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    {day.isToday && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          Day {day.dayNumber}
                        </p>
                        {day.isToday && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary-light text-primary">
                            Today
                          </span>
                        )}
                        {day.isPast && !day.isToday && (
                          <span className="text-xs text-muted-foreground">
                            Past
                          </span>
                        )}
                        {day.isFuture && (
                          <span className="text-xs text-muted-foreground">
                            Future
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(day.dateObj), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasBlocks && (
                        <span className="text-xs text-muted-foreground">
                          {day.blocks.length} block{day.blocks.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Day Blocks */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-border/50 pt-4">
                    {hasBlocks ? (
                      day.blocks
                        .sort((a, b) => {
                          const aTime = a.startTime.split(":").map(Number);
                          const bTime = b.startTime.split(":").map(Number);
                          return aTime[0] * 60 + aTime[1] - (bTime[0] * 60 + bTime[1]);
                        })
                        .map((block) => (
                          <div
                            key={block.id}
                            className="p-3 rounded-xl bg-muted/50 border border-border/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">
                                  {block.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                  </span>
                                  {block.category && (
                                    <>
                                      <span>·</span>
                                      <span>{block.category}</span>
                                    </>
                                  )}
                                </div>
                                {block.note && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {block.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">
                          No routine blocks scheduled for this day
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit Phase Modal */}
        {showEditPhase && phase && (
          <EditPhaseModal
            phase={{
              id: phase.id,
              name: phase.name,
              durationDays: phase.durationDays,
              startDate: phase.startDate,
              endDate: phase.endDate,
              why: "",
              outcome: "",
              isActive: true,
              currentDay: phase.currentDay,
            }}
            onClose={() => setShowEditPhase(false)}
            onSave={() => {
              setShowEditPhase(false);
              window.location.reload();
            }}
          />
        )}

        {/* Archive Phase Modal */}
        {showArchivePhase && phase && (
          <ArchivePhaseModal
            phase={{
              id: phase.id,
              name: phase.name,
              durationDays: phase.durationDays,
              startDate: phase.startDate,
              endDate: phase.endDate,
              why: "",
              outcome: "",
              isActive: true,
              currentDay: phase.currentDay,
            }}
            onClose={() => setShowArchivePhase(false)}
            onConfirm={() => {
              window.location.href = "/";
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

