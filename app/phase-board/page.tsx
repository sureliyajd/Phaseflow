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
  Pencil,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, parseISO, isToday, isPast, isFuture } from "date-fns";
import { EditPhaseModal } from "@/components/phases/EditPhaseModal";
import { ArchivePhaseModal } from "@/components/phases/ArchivePhaseModal";
import { EditDayBlocksModal } from "@/components/phases/EditDayBlocksModal";

interface Phase {
  id: string;
  name: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  why: string;
  outcome: string;
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
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingDayBlocks, setEditingDayBlocks] = useState<DayBlock[]>([]);
  const [isPhaseIntentExpanded, setIsPhaseIntentExpanded] = useState(true);

  useEffect(() => {
    const fetchPhaseData = async () => {
      try {
        // Get active phase
        const phaseResponse = await fetch("/api/phases/active");
        const phaseData = await phaseResponse.json();

        if (!phaseResponse.ok || !phaseData.phase) {
          router.push("/home");
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

          // Check if user has seen phase intent section a few times
          const viewCountKey = `phase-intent-views-${daysData.phase.id}`;
          const viewCount = parseInt(localStorage.getItem(viewCountKey) || "0", 10);
          if (viewCount >= 3) {
            setIsPhaseIntentExpanded(false);
          }
          localStorage.setItem(viewCountKey, String(viewCount + 1));
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
            <p className="text-muted-foreground">Getting your phase ready...</p>
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

          {/* Phase Intent Section */}
          <div className="mt-4">
            <button
              onClick={() => setIsPhaseIntentExpanded(!isPhaseIntentExpanded)}
              className="w-full card-soft p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Phase Intent</span>
                </div>
                {isPhaseIntentExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {isPhaseIntentExpanded && (
              <div className="card-soft p-4 mt-2 border-t-0 rounded-t-none">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">This phase is driven by:</p>
                    <p className="text-foreground">{phase.why}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">You're hoping for:</p>
                    <p className="text-foreground">{phase.outcome}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="px-5 space-y-1.5">
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
                {/* Day Header - Compact */}
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => toggleDay(day.date)}
                    className="flex items-center gap-2 flex-1 text-left min-w-0 hover:bg-muted/50 transition-colors rounded-lg p-2 -m-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {day.isToday && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      {day.isPast && !day.isToday && (
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                      )}
                      {day.isFuture && (
                        <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">
                            Day {day.dayNumber}
                          </p>
                          {day.isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-light text-primary">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {format(parseISO(day.dateObj), "MMM d")}
                          </p>
                          {hasBlocks && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">
                                {day.blocks.length} {day.blocks.length === 1 ? "block" : "blocks"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDay(day.date);
                      setEditingDayBlocks(day.blocks);
                    }}
                    title="Edit blocks for this day"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>

                {/* Day Blocks */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-1.5 border-t border-border/30 pt-3">
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
                            className="p-2.5 rounded-lg bg-muted/30 border border-border/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground">
                                  {block.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                  </span>
                                  {block.category && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate">{block.category}</span>
                                    </>
                                  )}
                                </div>
                                {block.note && (
                                  <p className="text-xs text-muted-foreground mt-1 italic truncate">
                                    {block.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          A quiet day — nothing planned yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDay(day.date);
                            setEditingDayBlocks([]);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Add something
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit Day Blocks Modal */}
        {editingDay && phase && (
          <EditDayBlocksModal
            phaseId={phase.id}
            date={editingDay}
            initialBlocks={editingDayBlocks}
            onClose={() => {
              setEditingDay(null);
              setEditingDayBlocks([]);
            }}
            onSave={() => {
              setEditingDay(null);
              setEditingDayBlocks([]);
              // Refresh phase data
              window.location.reload();
            }}
          />
        )}

        {/* Edit Phase Modal */}
        {showEditPhase && phase && (
          <EditPhaseModal
            phase={{
              id: phase.id,
              name: phase.name,
              durationDays: phase.durationDays,
              startDate: phase.startDate,
              endDate: phase.endDate,
              why: phase.why,
              outcome: phase.outcome,
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
              why: phase.why,
              outcome: phase.outcome,
              isActive: true,
              currentDay: phase.currentDay,
            }}
            onClose={() => setShowArchivePhase(false)}
            onConfirm={() => {
              window.location.href = "/home";
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

