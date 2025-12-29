"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Clock, Tag, Trash2, ChevronRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { ApplyChangesDialog } from "@/components/routine/ApplyChangesDialog";

type BlockColor = "primary" | "accent" | "calm" | "secondary";

interface RoutineBlock {
  id: string;
  title: string;
  description?: string;
  time: string;
  duration: string;
  color: BlockColor;
  category?: string;
}

const colorOptions: { id: BlockColor; label: string; class: string }[] = [
  { id: "primary", label: "Teal", class: "bg-primary" },
  { id: "accent", label: "Coral", class: "bg-accent" },
  { id: "calm", label: "Blue", class: "bg-calm" },
  { id: "secondary", label: "Yellow", class: "bg-secondary-foreground" },
];

const durationOptions = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
  "2 hours",
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
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<BlockColor>("primary");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [startTime, setStartTime] = useState("09:00");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [pendingBlock, setPendingBlock] = useState<RoutineBlock | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedColor("primary");
    setSelectedDuration("30 min");
    setStartTime("09:00");
    setSelectedCategory("");
    setNote("");
    setIsAdding(false);
    setEditingBlock(null);
  };

  const loadBlockForEdit = (block: RoutineBlock) => {
    setTitle(block.title);
    setDescription(block.description || "");
    setSelectedColor(block.color);
    setSelectedDuration(block.duration);
    // Parse time from "9:00 AM" format back to "09:00"
    const timeMatch = block.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      setStartTime(`${hours.toString().padStart(2, "0")}:${minutes}`);
    }
    setSelectedCategory(block.category || "");
    setEditingBlock(block);
    setIsAdding(true);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAddBlock = () => {
    if (!title.trim()) {
      return;
    }

    const blockData: RoutineBlock = {
      id: editingBlock?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      time: formatTime(startTime),
      duration: selectedDuration,
      color: selectedColor,
      category: selectedCategory || undefined,
    };

    if (editingBlock) {
      // Editing existing block - show apply dialog
      setPendingBlock(blockData);
      setShowApplyDialog(true);
    } else {
      // New block - add directly
      setCoreRoutine([...coreRoutine, blockData]);
      resetForm();
    }
  };

  const handleApplyChanges = (applyTo: "today" | "future" | "all") => {
    if (!pendingBlock) return;

    if (editingBlock) {
      // Update the block in the routine
      setCoreRoutine((prev) =>
        prev.map((b) => (b.id === editingBlock.id ? pendingBlock : b))
      );
    }

    // UI only - no backend logic yet
    console.log(`Applying changes to: ${applyTo}`);
    
    setShowApplyDialog(false);
    setPendingBlock(null);
    resetForm();
  };

  const handleContinue = () => {
    if (coreRoutine.length === 0) {
      return;
    }
    router.push("/clone-routine");
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/create-phase">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Core Routine
              </h1>
              <p className="text-sm text-muted-foreground">
                Build your daily template
              </p>
            </div>
          </div>
        </div>

        <div className="px-5">
          {/* Existing Blocks */}
          {coreRoutine.length > 0 && (
            <div className="space-y-3 mb-6">
              {coreRoutine.map((block, index) => (
                <div
                  key={block.id}
                  className={`p-4 rounded-2xl border ${colorMap[block.color]} transition-all duration-200`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${dotColorMap[block.color]}`}
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {block.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {block.time} · {block.duration}
                          </span>
                          {block.category && (
                            <>
                              <span>·</span>
                              <span>{block.category}</span>
                            </>
                          )}
                        </div>
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
                        onClick={() =>
                          setCoreRoutine(
                            coreRoutine.filter((b) => b.id !== block.id)
                          )
                        }
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Meditation"
                    className="input-soft w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's the purpose of this block?"
                    rows={2}
                    className="input-soft w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-soft w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Duration
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="input-soft w-full"
                    >
                      {durationOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <input
                    type="text"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="e.g., Health, Work, Learning"
                    className="input-soft w-full"
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
                  <Button onClick={handleAddBlock} className="flex-1">
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

          {/* Continue Button */}
          {coreRoutine.length > 0 && !isAdding && (
            <div className="mt-6">
              <Button size="xl" className="w-full" onClick={handleContinue}>
                Continue to Clone
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Empty State */}
          {coreRoutine.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Build your ideal daily routine by adding blocks above.
              </p>
            </div>
          )}
        </div>

        {/* Apply Changes Dialog */}
        {showApplyDialog && (
          <ApplyChangesDialog
            onClose={() => {
              setShowApplyDialog(false);
              setPendingBlock(null);
            }}
            onApply={handleApplyChanges}
          />
        )}
      </div>
    </AppLayout>
  );
}

