"use client";

import { Archive, X } from "lucide-react";
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

interface ArchivePhaseModalProps {
  phase: Phase | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArchivePhaseModal({ phase, onClose, onConfirm }: ArchivePhaseModalProps) {
  if (!phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Archive Phase</h2>
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
              Are you sure you want to archive <strong>{phase.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This will end your current phase. You can start a new phase anytime.
            </p>
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
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              className="flex-1"
            >
              Archive Phase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

