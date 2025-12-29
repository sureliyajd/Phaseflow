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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/phases/${phase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          why,
          outcome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update phase");
        setIsLoading(false);
        return;
      }

      // Pass the updated phase data
      onSave({
        name: data.phase.name,
        why: data.phase.why,
        outcome: data.phase.outcome,
      });
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
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
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
              disabled={isLoading}
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

