"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, Tag, Trash2, Edit2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { CloneRoutineModal } from "@/components/routine/CloneRoutineModal";

type BlockColor = "primary" | "accent" | "calm" | "secondary";

interface RoutineBlock {
  id: string;
  title: string;
  note?: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  color: BlockColor;
  category?: string;
}

const colorOptions: { id: BlockColor; label: string; class: string }[] = [
  { id: "primary", label: "Teal", class: "bg-primary" },
  { id: "accent", label: "Coral", class: "bg-accent" },
  { id: "calm", label: "Blue", class: "bg-calm" },
  { id: "secondary", label: "Yellow", class: "bg-secondary-foreground" },
];

const colorMap = {
  primary: "bg-primary-light border-primary/20",
  accent: "bg-accent/20 border-accent/30",
  calm: "bg-calm/20 border-calm/30",
  secondary: "bg-secondary border-secondary-foreground/10",
};

const dotColorMap = {
  primary: "bg-primary",
  accent: "bg-accent",
  calm: "bg-calm",
  secondary: "bg-secondary-foreground",
};

export default function RoutineBuilder() {
  const router = useRouter();
  const [coreRoutine, setCoreRoutine] = useState<RoutineBlock[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedColor, setSelectedColor] = useState<BlockColor>("primary");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch active phase and existing template blocks
  useEffect(() => {
    const fetchActivePhase = async () => {
      try {
        const response = await fetch("/api/phases/active");
        const data = await response.json();
        
        if (response.ok && data.phase) {
          setActivePhaseId(data.phase.id);
          
          // Fetch existing template blocks
          const blocksResponse = await fetch(`/api/phases/${data.phase.id}/routine-blocks`);
          const blocksData = await blocksResponse.json();
          
          if (blocksResponse.ok && blocksData.blocks) {
            const formattedBlocks: RoutineBlock[] = blocksData.blocks.map((b: any) => ({
              id: b.id,
              title: b.title,
              note: b.note || undefined,
              startTime: b.startTime,
              endTime: b.endTime,
              color: "primary" as BlockColor, // Default color, can be enhanced later
              category: b.category?.name && b.category.name !== "Uncategorized" ? b.category.name : undefined,
            }));
            setCoreRoutine(formattedBlocks);
          }
        } else {
          // No active phase, redirect to create phase
          router.push("/create-phase");
        }
      } catch (error) {
        console.error("Error fetching active phase:", error);
      }
    };

    fetchActivePhase();
  }, [router]);

  // Load existing categories from blocks
  useEffect(() => {
    const existingCategories = Array.from(
      new Set(
        coreRoutine
          .map((b) => b.category)
          .filter((c): c is string => !!c)
      )
    );
    setCategories(existingCategories);
  }, [coreRoutine]);

  const resetForm = () => {
    setTitle("");
    setNote("");
    setSelectedColor("primary");
    setStartTime("09:00");
    setEndTime("09:30");
    setSelectedCategory("");
    setIsAdding(false);
    setEditingBlock(null);
    setTimeError("");
  };

  const loadBlockForEdit = (block: RoutineBlock) => {
    setTitle(block.title);
    setNote(block.note || "");
    setSelectedColor(block.color);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setSelectedCategory(block.category || "");
    setEditingBlock(block);
    setIsAdding(true);
    setTimeError("");
  };

  // Convert time string (HH:MM) to minutes since midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Check for time overlaps
  const checkTimeOverlap = (
    start: string,
    end: string,
    excludeId?: string
  ): boolean => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    if (startMin >= endMin) {
      setTimeError("End time must be after start time");
      return true;
    }

    // Check if times are within a single day (00:00 to 23:59)
    if (startMin < 0 || endMin > 1439) {
      setTimeError("Times must be within a single day (00:00 - 23:59)");
      return true;
    }

    // Check for overlaps with existing blocks
    for (const block of coreRoutine) {
      if (excludeId && block.id === excludeId) continue;

      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);

      // Check if new block overlaps with existing block
      if (
        (startMin >= blockStart && startMin < blockEnd) ||
        (endMin > blockStart && endMin <= blockEnd) ||
        (startMin <= blockStart && endMin >= blockEnd)
      ) {
        setTimeError(
          `Overlaps with "${block.title}" (${formatTime(block.startTime)} - ${formatTime(block.endTime)})`
        );
        return true;
    }
    }

    setTimeError("");
    return false;
  };

  const formatTime = (time: string): string => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartTime(value);
      // Auto-adjust end time if it's before start time
      if (timeToMinutes(value) >= timeToMinutes(endTime)) {
        const newEnd = new Date();
        newEnd.setHours(parseInt(value.split(":")[0]));
        newEnd.setMinutes(parseInt(value.split(":")[1]) + 30);
        setEndTime(
          `${newEnd.getHours().toString().padStart(2, "0")}:${newEnd.getMinutes().toString().padStart(2, "0")}`
        );
      }
    } else {
      setEndTime(value);
    }

    // Validate after a short delay
    setTimeout(() => {
      if (type === "start") {
        checkTimeOverlap(value, endTime, editingBlock?.id);
      } else {
        checkTimeOverlap(startTime, value, editingBlock?.id);
      }
    }, 100);
  };

  const handleAddBlock = async () => {
    if (!title.trim()) {
      return;
    }

    // Validate times
    if (checkTimeOverlap(startTime, endTime, editingBlock?.id)) {
      return;
    }

    if (!activePhaseId) {
      setTimeError("No active phase found");
      return;
    }

    const blockData: RoutineBlock = {
      id: editingBlock?.id || Date.now().toString(),
      title: title.trim(),
      note: note.trim() || undefined,
      startTime,
      endTime,
      color: selectedColor,
      category: selectedCategory || undefined,
    };

    // Update local state
    let updatedRoutine: RoutineBlock[];
    if (editingBlock) {
      updatedRoutine = coreRoutine.map((b) =>
        b.id === editingBlock.id ? blockData : b
      );
    } else {
      updatedRoutine = [...coreRoutine, blockData];
    }
    setCoreRoutine(updatedRoutine);

    resetForm();

    // Save to backend
    await saveTemplateBlocks(updatedRoutine);
  };

  const saveTemplateBlocks = async (blocksToSave?: RoutineBlock[]) => {
    if (!activePhaseId) return;

    const blocks = blocksToSave || coreRoutine;
    if (blocks.length === 0) {
      // If no blocks, still save to clear templates
      try {
        await fetch(`/api/phases/${activePhaseId}/routine-blocks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ blocks: [] }),
        });
      } catch (error) {
        console.error("Error clearing blocks:", error);
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload = blocks.map((b) => ({
        title: b.title,
        note: b.note,
        startTime: b.startTime,
        endTime: b.endTime,
        category: b.category,
      }));

      const response = await fetch(`/api/phases/${activePhaseId}/routine-blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocks: payload }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error saving blocks:", data.error);
        // Could show error toast here
      }
    } catch (error) {
      console.error("Error saving template blocks:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    const updatedRoutine = coreRoutine.filter((b) => b.id !== blockId);
    setCoreRoutine(updatedRoutine);
    // Save after deletion
    await saveTemplateBlocks(updatedRoutine);
  };

  const handleApplyRoutine = () => {
    if (coreRoutine.length === 0) {
      return;
    }
    setShowCloneModal(true);
  };

  const handleCloneComplete = () => {
    // After cloning, redirect to phase board
    router.push("/phase-board");
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
          {/* Onboarding Header */}
        <div className="px-5 pt-8 pb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Design Your Day
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto mb-2">
              Build a day that feels sustainable, not perfect. You can always adjust later.
            </p>
            <p className="text-xs text-muted-foreground">
              Blocks are sorted by time and can't overlap
            </p>
          </div>
        </div>

        <div className="px-5">
          {/* Existing Blocks */}
          {coreRoutine.length > 0 && (
            <div className="space-y-3 mb-6">
              {coreRoutine
                .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                .map((block, index) => (
                <div
                  key={block.id}
                  className={`p-4 rounded-2xl border ${colorMap[block.color]} transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${dotColorMap[block.color]}`}
                      />
                        <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {block.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>
                              {formatTime(block.startTime)} - {formatTime(block.endTime)}
                          </span>
                          {block.category && (
                            <>
                              <span>·</span>
                                <Tag className="w-3 h-3" />
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => loadBlockForEdit(block)}
                          title="Edit Block"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteBlock(block.id)}
                          title="Delete Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Block Form */}
          {isAdding ? (
            <div className="card-soft mb-6">
              <h3 className="font-semibold text-foreground mb-4">
                {editingBlock ? "Edit Routine Block" : "New Routine Block"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Meditation"
                    className="input-soft w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleTimeChange("start", e.target.value)}
                      className="input-soft w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleTimeChange("end", e.target.value)}
                      className="input-soft w-full"
                      required
                    />
                  </div>
                </div>

                {timeError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{timeError}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <div className="space-y-2">
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                              selectedCategory === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  <input
                    type="text"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                      placeholder="Type to create new or select above"
                    className="input-soft w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any additional details or reminders..."
                    rows={2}
                    className="input-soft w-full resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-10 h-10 rounded-xl ${color.class} transition-all ${
                          selectedColor === color.id
                            ? "ring-2 ring-offset-2 ring-foreground/20 scale-110"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBlock}
                    className="flex-1"
                    disabled={!!timeError || !title.trim()}
                  >
                    {editingBlock ? "Save Changes" : "Add Block"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Routine Block
            </Button>
          )}

          {/* Apply Routine CTA */}
          {coreRoutine.length > 0 && !isAdding && (
            <div className="mt-8">
              <div className="card-soft p-6 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Looking good so far
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You've set up {coreRoutine.length} {coreRoutine.length === 1 ? "block" : "blocks"}. 
                  Ready to bring this routine into your phase?
                </p>
                <Button size="xl" className="w-full" onClick={handleApplyRoutine}>
                  Apply to my phase
              </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {coreRoutine.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">
                Start shaping your day
              </p>
              <p className="text-sm text-muted-foreground">
                Add a block for something that matters to you
              </p>
            </div>
          )}
        </div>

        {/* Clone Routine Modal */}
        {showCloneModal && activePhaseId && (
          <CloneRoutineModal
            routineBlocks={coreRoutine}
            phaseId={activePhaseId}
            onClose={() => setShowCloneModal(false)}
            onComplete={handleCloneComplete}
          />
        )}
      </div>
    </AppLayout>
  );
}

