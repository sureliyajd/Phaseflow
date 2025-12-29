"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, Tag, FileText, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface RoutineBlock {
  id?: string;
  title: string;
  note?: string | null;
  startTime: string;
  endTime: string;
  category: string;
}

interface EditDayBlocksModalProps {
  phaseId: string;
  date: string;
  initialBlocks: RoutineBlock[];
  onClose: () => void;
  onSave: () => void;
}

type Scope = "day" | "future" | "selected";

export function EditDayBlocksModal({
  phaseId,
  date,
  initialBlocks,
  onClose,
  onSave,
}: EditDayBlocksModalProps) {
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [scope, setScope] = useState<Scope>("day");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [timeErrors, setTimeErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    setBlocks(
      initialBlocks.length > 0
        ? initialBlocks.map((b) => ({
            ...b,
            category: b.category || "",
          }))
        : [
            {
              title: "",
              startTime: "09:00",
              endTime: "09:30",
              category: "",
            },
          ]
    );

    // Extract unique categories from initial blocks
    const uniqueCategories = Array.from(
      new Set(initialBlocks.map((b) => b.category).filter(Boolean))
    ) as string[];
    setCategories(uniqueCategories);
  }, [initialBlocks]);

  const validateTimeRange = (startTime: string, endTime: string): string | null => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      return "End time must be after start time";
    }

    if (endMinutes - startMinutes > 24 * 60) {
      return "Block cannot span more than 24 hours";
    }

    return null;
  };

  const validateNoOverlaps = (): boolean => {
    const errors: Record<number, string> = {};

    for (let i = 0; i < blocks.length; i++) {
      const error = validateTimeRange(blocks[i].startTime, blocks[i].endTime);
      if (error) {
        errors[i] = error;
        continue;
      }

      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i];
        const b = blocks[j];

        const aStart = a.startTime.split(":").map(Number);
        const aEnd = a.endTime.split(":").map(Number);
        const bStart = b.startTime.split(":").map(Number);
        const bEnd = b.endTime.split(":").map(Number);

        const aStartMinutes = aStart[0] * 60 + aStart[1];
        const aEndMinutes = aEnd[0] * 60 + aEnd[1];
        const bStartMinutes = bStart[0] * 60 + bStart[1];
        const bEndMinutes = bEnd[0] * 60 + bEnd[1];

        if (
          (aStartMinutes < bEndMinutes && aEndMinutes > bStartMinutes) ||
          (bStartMinutes < aEndMinutes && bEndMinutes > aStartMinutes)
        ) {
          errors[i] = "Blocks cannot overlap in time";
          errors[j] = "Blocks cannot overlap in time";
        }
      }
    }

    setTimeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        title: "",
        startTime: "09:00",
        endTime: "09:30",
        category: "",
      },
    ]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    const newErrors = { ...timeErrors };
    delete newErrors[index];
    setTimeErrors(newErrors);
  };

  const updateBlock = (index: number, field: keyof RoutineBlock, value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
    validateNoOverlaps();
  };

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const handleSave = async () => {
    setError("");

    // Validate all blocks have required fields
    const invalidBlocks = blocks.filter(
      (b) => !b.title.trim() || !b.startTime || !b.endTime
    );

    if (invalidBlocks.length > 0) {
      setError("Please fill in all required fields for all blocks");
      return;
    }

    if (!validateNoOverlaps()) {
      setError("Please fix time overlap errors before saving");
      return;
    }

    if (scope === "selected" && selectedDates.length === 0) {
      setError("Please select at least one date");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/phases/${phaseId}/days/${date}/blocks`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blocks: blocks.map((b) => ({
              title: b.title.trim(),
              note: b.note?.trim() || null,
              startTime: b.startTime,
              endTime: b.endTime,
              category: b.category.trim() || "Uncategorized",
            })),
            scope,
            selectedDates: scope === "selected" ? selectedDates : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save blocks");
        setIsSaving(false);
        return;
      }

      onSave();
    } catch (error) {
      console.error("Error saving blocks:", error);
      setError("An error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Adjust This Day</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {format(parseISO(date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Scope Selection */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/30">
          <label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Where should this apply?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                value="day"
                checked={scope === "day"}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-4 h-4"
                disabled={isSaving}
              />
              <span className="text-sm text-foreground">Just this day</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                value="future"
                checked={scope === "future"}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-4 h-4"
                disabled={isSaving}
              />
              <span className="text-sm text-foreground">This day and all days ahead</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                value="selected"
                checked={scope === "selected"}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-4 h-4"
                disabled={isSaving}
              />
              <span className="text-sm text-foreground">Specific dates I choose</span>
            </label>
            {scope === "selected" && (
              <div className="ml-6 mt-2">
                <input
                  type="text"
                  placeholder="Enter dates (comma-separated, YYYY-MM-DD)"
                  value={selectedDates.join(", ")}
                  onChange={(e) =>
                    setSelectedDates(
                      e.target.value
                        .split(",")
                        .map((d) => d.trim())
                        .filter(Boolean)
                    )
                  }
                  className="input-soft w-full text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: YYYY-MM-DD, YYYY-MM-DD, ...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-4 mb-6">
          {blocks.map((block, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border/50 bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  Block {index + 1}
                </h3>
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeBlock(index)}
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={block.title}
                    onChange={(e) => updateBlock(index, "title", e.target.value)}
                    className="input-soft w-full text-sm"
                    placeholder="e.g., Morning Meditation"
                    required
                    disabled={isSaving}
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => updateBlock(index, "startTime", e.target.value)}
                      className="input-soft w-full text-sm"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => updateBlock(index, "endTime", e.target.value)}
                      className="input-soft w-full text-sm"
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {timeErrors[index] && (
                  <p className="text-xs text-red-500">{timeErrors[index]}</p>
                )}

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={block.category}
                      onChange={(e) => updateBlock(index, "category", e.target.value)}
                      list={`categories-${index}`}
                      className="input-soft w-full text-sm"
                      placeholder="e.g., Work, Health"
                      disabled={isSaving}
                    />
                    <datalist id={`categories-${index}`}>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    {block.category && !categories.includes(block.category) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCategory(block.category)}
                        disabled={isSaving}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Note (optional)
                  </label>
                  <textarea
                    value={block.note || ""}
                    onChange={(e) => updateBlock(index, "note", e.target.value)}
                    className="input-soft w-full text-sm resize-none"
                    rows={2}
                    placeholder="Add a note..."
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Block Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-6"
          onClick={addBlock}
          disabled={isSaving}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Block
        </Button>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={isSaving || blocks.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

