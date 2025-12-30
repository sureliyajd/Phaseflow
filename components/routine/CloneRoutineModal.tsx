"use client";

import { useState, useEffect } from "react";
import { Calendar, CalendarDays, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, isWeekend, parseISO } from "date-fns";

interface RoutineBlock {
  id: string;
  title: string;
  note?: string;
  startTime: string;
  endTime: string;
  color: string;
  category?: string;
}

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

interface CloneRoutineModalProps {
  routineBlocks: RoutineBlock[];
  phaseId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function CloneRoutineModal({
  routineBlocks,
  phaseId,
  onClose,
  onComplete,
}: CloneRoutineModalProps) {
  const [cloneOption, setCloneOption] = useState<"all" | "weekdays" | "custom">("all");
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [newExcludedDate, setNewExcludedDate] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const response = await fetch(`/api/phases/${phaseId}`);
        const data = await response.json();
        if (response.ok && data.phase) {
          setPhase(data.phase);
        }
      } catch (error) {
        console.error("Error fetching phase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhase();
  }, [phaseId]);

  const phaseStartDate = phase ? new Date(phase.startDate) : new Date();
  const phaseDuration = phase?.durationDays || 30;
  const phaseEndDate = phase ? new Date(phase.endDate) : addDays(phaseStartDate, phaseDuration - 1);

  const handleAddExcludedDate = () => {
    if (newExcludedDate && !excludedDates.includes(newExcludedDate)) {
      setExcludedDates([...excludedDates, newExcludedDate]);
      setNewExcludedDate("");
    }
  };

  const handleRemoveExcludedDate = (date: string) => {
    setExcludedDates(excludedDates.filter((d) => d !== date));
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const response = await fetch(`/api/phases/${phaseId}/clone-routine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          option: cloneOption,
          excludedDates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error cloning routine:", data.error);
        // Show error - for now just log
        setIsCompleting(false);
        return;
      }

      setIsCompleting(false);
      onComplete();
    } catch (error) {
      console.error("Error cloning routine:", error);
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="card-soft w-full max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md max-h-[90vh] overflow-y-auto pb-24 md:pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Bring Your Routine to Life</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              How would you like to spread your {routineBlocks.length} {routineBlocks.length === 1 ? "block" : "blocks"} across your phase?
            </p>

            {/* Clone Options */}
            <div className="space-y-3">
              <button
                onClick={() => setCloneOption("all")}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  cloneOption === "all"
                    ? "bg-primary-light border-primary/30"
                    : "bg-card border-border/50 hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Every Day
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Fill all {phaseDuration} days with this routine
                    </p>
                  </div>
                  {cloneOption === "all" && (
                    <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setCloneOption("weekdays")}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  cloneOption === "weekdays"
                    ? "bg-primary-light border-primary/30"
                    : "bg-card border-border/50 hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Weekdays Only
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Keep weekends free
                    </p>
                  </div>
                  {cloneOption === "weekdays" && (
                    <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setCloneOption("custom")}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  cloneOption === "custom"
                    ? "bg-primary-light border-primary/30"
                    : "bg-card border-border/50 hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-calm/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-calm" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Custom Selection
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Skip certain dates
                    </p>
                  </div>
                  {cloneOption === "custom" && (
                    <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Custom Date Exclusion */}
          {cloneOption === "custom" && (
            <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground block">
              Pick dates to skip
            </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newExcludedDate}
                  onChange={(e) => setNewExcludedDate(e.target.value)}
                  min={format(phaseStartDate, "yyyy-MM-dd")}
                  max={format(phaseEndDate, "yyyy-MM-dd")}
                  className="input-soft flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddExcludedDate}
                  disabled={!newExcludedDate}
                >
                  Add
                </Button>
              </div>
              {excludedDates.length > 0 && (
                <div className="space-y-2">
                  {excludedDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span className="text-sm text-foreground">
                        {format(parseISO(date), "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExcludedDate(date)}
                        className="h-6 px-2 text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-sm font-medium text-foreground mb-1">
              Here's what'll happen
            </p>
            <p className="text-xs text-muted-foreground">
              {cloneOption === "all" && (
                <>Your routine will fill all {phaseDuration} days. You can always adjust individual days later.</>
              )}
              {cloneOption === "weekdays" && (
                <>Your routine will appear on weekdays, leaving weekends open for rest or flexibility.</>
              )}
              {cloneOption === "custom" && (
                <>
                  Your routine will fill all days except{" "}
                  {excludedDates.length > 0
                    ? `the ${excludedDates.length} ${excludedDates.length === 1 ? "date" : "dates"} you've chosen to skip`
                    : "- select dates above to exclude them"}
                  .
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 pb-4 md:pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isCompleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleComplete}
              className="flex-1"
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Routine"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

