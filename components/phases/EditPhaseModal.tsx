"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface EditPhaseModalProps {
  phase: Phase | null;
  onClose: () => void;
  onSave: (updatedPhase: Partial<Phase>) => void;
}

export function EditPhaseModal({ phase, onClose, onSave }: EditPhaseModalProps) {
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [outcome, setOutcome] = useState("");

  useEffect(() => {
    if (phase) {
      setName(phase.name);
      setWhy(phase.why);
      setOutcome(phase.outcome);
    }
  }, [phase]);

  if (!phase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      why,
      outcome,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Phase</h2>
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
              Phase Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-soft w-full"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Why are you doing this phase? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Expected Outcome <span className="text-red-500">*</span>
            </label>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
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

