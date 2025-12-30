"use client";

import { useState } from "react";
import { Archive, X, Loader2 } from "lucide-react";
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
  currentDay?: number;
}

interface ArchivePhaseModalProps {
  phase: Phase | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArchivePhaseModal({ phase, onClose, onConfirm }: ArchivePhaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!phase) return null;

  const handleArchive = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/phases/${phase.id}/archive`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to archive phase");
        setIsLoading(false);
        return;
      }

      onConfirm();
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md max-h-[90vh] overflow-y-auto pb-24 md:pb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Close This Phase</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Archive className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="text-center">
            <p className="text-foreground mb-2">
              Ready to close <strong>{phase.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This phase will be archived, but your progress stays with you. 
              You can begin a fresh phase whenever you're ready.
            </p>

            {/* Reflection Summary */}
            {(phase.why || phase.outcome) && (
              <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/30 text-left">
                <h3 className="text-sm font-semibold text-foreground mb-3">Looking back</h3>
                {phase.why && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">This phase was driven by:</p>
                    <p className="text-sm text-foreground">{phase.why}</p>
                  </div>
                )}
                {phase.outcome && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">You were hoping for:</p>
                    <p className="text-sm text-foreground">{phase.outcome}</p>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-sm text-foreground italic">
                    Looking back, how close do you feel you came?
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
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
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchive}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Phase"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

