"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Check, X, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { EditDayBlocksModal } from "@/components/phases/EditDayBlocksModal";
import { format, addDays, subDays } from "date-fns";
import { getColorMap, type BlockColor } from "@/lib/block-colors";

const colorMap = getColorMap();

type BlockStatus = "DONE" | "SKIPPED" | "PENDING";

interface Block {
  id: string;
  title: string;
  note: string | null;
  startTime: string;
  endTime: string;
  category: string | null;
  executionStatus: BlockStatus;
}

interface Phase {
  id: string;
  name: string;
  why?: string;
  outcome?: string;
}

export default function Today() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingBlockId, setUpdatingBlockId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const completedCount = blocks.filter(
    (b) => b.executionStatus === "DONE"
  ).length;

  // Fetch blocks for selected date
  useEffect(() => {
    const fetchBlocks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/today/blocks?date=${dateStr}`);
        const data = await response.json();

        if (response.ok) {
          setBlocks(data.blocks || []);
          setPhase(data.phase);
        } else {
          console.error("Error fetching blocks:", data.error);
          setBlocks([]);
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
        setBlocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, [dateStr]);

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleStatus = async (blockId: string, status: "DONE" | "SKIPPED") => {
    setUpdatingBlockId(blockId);

    // Optimistically update UI
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, executionStatus: status } : b
      )
    );

    try {
      const response = await fetch("/api/today/executions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routineBlockId: blockId,
          date: dateStr,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error updating execution:", data.error);
        // Revert optimistic update on error
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? { ...b, executionStatus: "PENDING" as BlockStatus }
              : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating execution:", error);
      // Revert optimistic update on error
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, executionStatus: "PENDING" as BlockStatus }
            : b
        )
      );
    } finally {
      setUpdatingBlockId(null);
    }
  };

  // Determine color based on category or use default
  const getBlockColor = (category: string | null): keyof typeof colorMap => {
    if (!category) return "primary";
    // Simple hash-based color assignment
    const colors: BlockColor[] = ["primary", "accent", "calm", "secondary", "purple", "green", "orange", "pink", "indigo", "red"];
    const hash = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your Day</h1>

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
            <div className="text-center flex-1">
              <p className="font-semibold text-foreground">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} of {blocks.length} completed
              </p>
            </div>
            <div className="flex gap-1">
              {phase && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEditModal(true)}
                  title="Edit blocks"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
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
        </div>

        <div className="px-5 pb-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading blocks...</p>
            </div>
          ) : !phase ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">You don't have an active phase yet</p>
              <Link href="/create-phase">
                <Button variant="outline">Start one when you're ready</Button>
              </Link>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                Nothing scheduled today. That's okay — take it easy.
              </p>
              {phase?.why && (
                <p className="text-sm text-foreground mt-3 px-4">
                  Remember: this phase is about {phase.why.toLowerCase()}. Even small steps count.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block, index) => {
                const blockColor = getBlockColor(block.category);
                const colors = colorMap[blockColor];
                const isDone = block.executionStatus === "DONE";
                const isSkipped = block.executionStatus === "SKIPPED";
                const isUpdating = updatingBlockId === block.id;

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
                        {block.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {block.note}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
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
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant={isDone ? "default" : "outline"}
                          size="icon"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => handleStatus(block.id, "DONE")}
                          disabled={isUpdating}
                          title="Mark as Done"
                        >
                          {isUpdating && isDone ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                          <Check className="w-5 h-5" />
                          )}
                        </Button>
                        <Button
                          variant={isSkipped ? "destructive" : "outline"}
                          size="icon"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => handleStatus(block.id, "SKIPPED")}
                          disabled={isUpdating}
                          title="Skip"
                        >
                          {isUpdating && isSkipped ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                          <X className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {(isDone || isSkipped) && (
                      <div
                        className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                          isDone
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {isDone ? "Completed" : "Skipped — that's okay"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Day Blocks Modal */}
        {showEditModal && phase && (
          <EditDayBlocksModal
            phaseId={phase.id}
            date={dateStr}
            initialBlocks={blocks.map((b) => ({
              id: b.id,
              title: b.title,
              note: b.note,
              startTime: b.startTime,
              endTime: b.endTime,
              category: b.category || "",
            }))}
            onClose={() => setShowEditModal(false)}
            onSave={() => {
              setShowEditModal(false);
              // Refresh blocks
              const fetchBlocks = async () => {
                setIsLoading(true);
                try {
                  const response = await fetch(`/api/today/blocks?date=${dateStr}`);
                  const data = await response.json();

                  if (response.ok) {
                    setBlocks(data.blocks || []);
                    setPhase(data.phase);
                  }
                } catch (error) {
                  console.error("Error fetching blocks:", error);
                } finally {
                  setIsLoading(false);
                }
              };
              fetchBlocks();
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

