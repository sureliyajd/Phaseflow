"use client";

import { Calendar, Clock, CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplyChangesDialogProps {
  onClose: () => void;
  onApply: (applyTo: "today" | "future" | "all") => void;
}

export function ApplyChangesDialog({ onClose, onApply }: ApplyChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-soft w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Apply Changes</h2>
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
          <p className="text-sm text-muted-foreground mb-4">
            How would you like to apply these changes?
          </p>

          <button
            onClick={() => onApply("today")}
            className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Today Only</p>
                <p className="text-sm text-muted-foreground">
                  Apply changes to today's routine
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onApply("future")}
            className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Future Days</p>
                <p className="text-sm text-muted-foreground">
                  Apply changes to all future days
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onApply("all")}
            className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-calm/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-calm" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">All Days</p>
                <p className="text-sm text-muted-foreground">
                  Apply changes to today and all future days
                </p>
              </div>
            </div>
          </button>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

