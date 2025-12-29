"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, parseISO, addDays, eachDayOfInterval, isWeekend } from "date-fns";

// Mock data
const activePhase = {
  name: "30-Day Focus Reset",
  startDate: "2024-01-01",
  endDate: "2024-01-30",
};
const coreRoutine = [
  { id: "1", title: "Morning Meditation" },
  { id: "2", title: "Deep Work Session" },
  { id: "3", title: "Exercise" },
];

export default function CloneRoutine() {
  const router = useRouter();

  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const startDate = parseISO(activePhase.startDate);
  const endDate = parseISO(activePhase.endDate);
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  const scheduledDays = allDates.filter((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (excludeWeekends && isWeekend(date)) return false;
    if (excludedDates.includes(dateStr)) return false;
    return true;
  });

  const totalBlocks = scheduledDays.length * coreRoutine.length;

  const toggleDate = (dateStr: string) => {
    setExcludedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleClone = () => {
    // In real app, clone routine via API
    router.push("/home");
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/routine-builder">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Clone Routine
              </h1>
              <p className="text-sm text-muted-foreground">
                Schedule across your phase
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-6">
          {/* Summary Card */}
          <div className="card-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Copy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {activePhase.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {coreRoutine.length}
                </p>
                <p className="text-xs text-muted-foreground">Blocks/day</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {scheduledDays.length}
                </p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {totalBlocks}
                </p>
                <p className="text-xs text-muted-foreground">Total blocks</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Options
            </h3>

            {/* Exclude Weekends */}
            <div className="card-soft flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Exclude Weekends</p>
                <p className="text-sm text-muted-foreground">
                  Skip Saturdays and Sundays
                </p>
              </div>
              <Switch
                checked={excludeWeekends}
                onCheckedChange={setExcludeWeekends}
              />
            </div>

            {/* Exclude Specific Dates */}
            <div className="card-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">Exclude Dates</p>
                  <p className="text-sm text-muted-foreground">
                    {excludedDates.length} date
                    {excludedDates.length !== 1 ? "s" : ""} excluded
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {showDatePicker ? "Hide" : "Select"}
                </Button>
              </div>

              {/* Date Grid */}
              {showDatePicker && (
                <div className="pt-4 border-t border-border/50">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {allDates.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const isExcluded = excludedDates.includes(dateStr);
                      const isWeekendDay = isWeekend(date);
                      const isAutoExcluded = excludeWeekends && isWeekendDay;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isAutoExcluded}
                          onClick={() => toggleDate(dateStr)}
                          className={`
                            aspect-square rounded-lg text-xs font-medium transition-all
                            ${
                              isAutoExcluded
                                ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                                : isExcluded
                                ? "bg-destructive/20 text-destructive"
                                : "bg-primary-light text-foreground hover:bg-primary/20"
                            }
                          `}
                        >
                          {format(date, "d")}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Tap dates to exclude them
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Clone Button */}
          <div className="pt-4">
            <Button size="xl" className="w-full" onClick={handleClone}>
              <Copy className="w-5 h-5 mr-2" />
              Clone to {scheduledDays.length} Days
            </Button>
          </div>

          {/* Encouragement */}
          <p className="text-center text-sm text-muted-foreground">
            You can always adjust individual days later. No pressure to be
            perfect.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

