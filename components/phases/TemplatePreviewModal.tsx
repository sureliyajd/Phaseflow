"use client";

import { X, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseTemplate } from "@/lib/phase-templates";

interface TemplatePreviewModalProps {
  template: PhaseTemplate;
  onClose: () => void;
  onUseTemplate: () => void;
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-elevated max-w-2xl w-full max-h-[calc(100vh-8rem)] md:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">{template.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Template Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{template.suggestedDuration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {template.weekendHandling === "include"
                  ? "Includes weekends"
                  : "Weekdays only"}
              </span>
            </div>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary-light text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Daily Routine Preview */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Example Daily Routine
            </h3>
            <div className="space-y-3">
              {template.blocks.map((block, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted border border-border/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {block.title}
                        </span>
                        {block.category && (
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-card border border-border">
                            {block.category}
                          </span>
                        )}
                      </div>
                      {block.note && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {block.note}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                      {block.startTime} - {block.endTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="p-4 rounded-xl bg-primary-light border border-primary/20">
            <p className="text-sm text-foreground">
              <strong className="font-semibold">This is just a starting point.</strong>{" "}
              You'll be able to fully customize your phase name, duration, and all routine
              blocks once you create it. Think of this template as inspiration to get you
              started.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border px-6 py-4 pb-6 md:pb-4 flex gap-3 rounded-b-2xl flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onUseTemplate} className="flex-1">
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  );
}

