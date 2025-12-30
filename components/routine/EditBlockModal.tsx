"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colorOptions, type BlockColor } from "@/lib/block-colors";

interface Block {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  color: BlockColor;
  executionStatus?: "DONE" | "SKIPPED" | "PENDING";
}

interface EditBlockModalProps {
  block: Block;
  onClose: () => void;
  onSave: (updatedBlock: Partial<Block>) => void;
}

const durationOptions = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
  "2 hours",
];

export function EditBlockModal({ block, onClose, onSave }: EditBlockModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [color, setColor] = useState<BlockColor>("primary");

  useEffect(() => {
    setTitle(block.title);
    setDescription(block.description);
    setTime(block.time);
    setDuration(block.duration);
    setColor(block.color);
  }, [block]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      time,
      duration,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md max-h-[90vh] overflow-y-auto pb-24 md:pb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Block</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-soft w-full"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-soft w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 9:00 AM"
                className="input-soft w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.id}
                  type="button"
                  onClick={() => setColor(colorOption.id)}
                  className={`w-10 h-10 rounded-xl ${colorOption.class} transition-all ${
                    color === colorOption.id
                      ? "ring-2 ring-offset-2 ring-foreground/20 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 pb-4 md:pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

