"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, addDays, subDays } from "date-fns";

const colorMap = {
  primary: { bg: "bg-primary-light", border: "border-primary/20", dot: "bg-primary" },
  accent: { bg: "bg-accent/20", border: "border-accent/30", dot: "bg-accent" },
  calm: { bg: "bg-calm/20", border: "border-calm/30", dot: "bg-calm" },
  secondary: {
    bg: "bg-secondary",
    border: "border-secondary-foreground/10",
    dot: "bg-secondary-foreground",
  },
};

type BlockStatus = "DONE" | "SKIPPED" | "PENDING";

interface Block {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  color: keyof typeof colorMap;
  executionStatus: BlockStatus;
}

// Mock data
const mockBlocks: Block[] = [
  {
    id: "1",
    title: "Morning Meditation",
    description: "15 minutes of mindfulness",
    time: "7:00 AM",
    duration: "15 min",
    color: "calm",
    executionStatus: "DONE",
  },
  {
    id: "2",
    title: "Deep Work Session",
    description: "Focus on important project",
    time: "9:00 AM",
    duration: "2 hours",
    color: "primary",
    executionStatus: "PENDING",
  },
  {
    id: "3",
    title: "Exercise",
    description: "Morning workout",
    time: "12:30 PM",
    duration: "45 min",
    color: "accent",
    executionStatus: "PENDING",
  },
];

export default function Today() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const todayBlocks = blocks; // In real app, filter by date
  const completedCount = todayBlocks.filter(
    (b) => b.executionStatus === "DONE"
  ).length;

  const handleStatus = (blockId: string, status: BlockStatus) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, executionStatus: status } : b
      )
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Today</h1>

          {/* Date Navigation */}
          <div className="flex items-center justify-between bg-card rounded-2xl p-3 shadow-soft border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} of {todayBlocks.length} completed
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {todayBlocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No blocks scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBlocks.map((block, index) => {
                const colors = colorMap[block.color];
                const isDone = block.executionStatus === "DONE";
                const isSkipped = block.executionStatus === "SKIPPED";

                return (
                  <div
                    key={block.id}
                    className={`p-4 rounded-2xl border ${colors.bg} ${colors.border} ${
                      isDone || isSkipped ? "opacity-60" : ""
                    } transition-all duration-200`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 ${colors.dot}`}
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-foreground ${
                            isDone ? "line-through" : ""
                          }`}
                        >
                          {block.title}
                        </h3>
                        {block.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {block.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {block.time} · {block.duration}
                        </p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant={isDone ? "default" : "outline"}
                          size="icon"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => handleStatus(block.id, "DONE")}
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                        <Button
                          variant={isSkipped ? "destructive" : "outline"}
                          size="icon"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => handleStatus(block.id, "SKIPPED")}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {(isDone || isSkipped) && (
                      <div
                        className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                          isDone
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {isDone ? "DONE" : "SKIPPED"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

