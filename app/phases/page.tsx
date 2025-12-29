"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Archive, CheckCircle2, Calendar, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format } from "date-fns";
import { EditPhaseModal } from "@/components/phases/EditPhaseModal";
import { ArchivePhaseModal } from "@/components/phases/ArchivePhaseModal";

interface Phase {
  id: string;
  name: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  why: string;
  outcome: string;
  isActive: boolean;
  createdAt: string;
  completedAt: string | null;
}

export default function PhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [archivingPhase, setArchivingPhase] = useState<Phase | null>(null);

  const fetchPhases = async () => {
    try {
      const response = await fetch("/api/phases");
      const data = await response.json();

      if (response.ok) {
        setPhases(data.phases);
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handleActivate = async (phaseId: string) => {
    try {
      const response = await fetch(`/api/phases/${phaseId}/activate`, {
        method: "PATCH",
      });

      if (response.ok) {
        // Refresh phases and redirect to dashboard
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Error activating phase:", error);
    }
  };

  const handleArchiveSuccess = () => {
    setArchivingPhase(null);
    fetchPhases();
  };

  const handleEditSuccess = () => {
    setEditingPhase(null);
    fetchPhases();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      </AppLayout>
    );
  }

  const activePhase = phases.find((p) => p.isActive);
  const archivedPhases = phases.filter((p) => !p.isActive);

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-4 sm:px-5 pt-8 pb-4">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Your Phases</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Every phase is a chapter of your journey
          </p>
          <div>
            <Link href="/create-phase" className="block">
              <Button size="sm" className="w-full sm:w-auto text-sm">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                New Phase
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-5 space-y-5 sm:space-y-6">
          {/* Active Phase */}
          {activePhase && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Currently Active
              </h2>
              <PhaseCard
                phase={activePhase}
                onEdit={() => setEditingPhase(activePhase)}
                onArchive={() => setArchivingPhase(activePhase)}
                isActive={true}
              />
            </div>
          )}

          {/* Archived Phases */}
          {archivedPhases.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Past Phases ({archivedPhases.length})
              </h2>
              <div className="space-y-3">
                {archivedPhases.map((phase) => (
                  <PhaseCard
                    key={phase.id}
                    phase={phase}
                    onEdit={() => setEditingPhase(phase)}
                    onArchive={() => setArchivingPhase(phase)}
                    onActivate={() => handleActivate(phase.id)}
                    isActive={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {phases.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                Your journey begins with a single phase. Ready when you are.
              </p>
              <Link href="/create-phase">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Begin Your First Phase
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingPhase && (
          <EditPhaseModal
            phase={editingPhase}
            onClose={() => setEditingPhase(null)}
            onSave={handleEditSuccess}
          />
        )}

        {/* Archive Modal */}
        {archivingPhase && (
          <ArchivePhaseModal
            phase={archivingPhase}
            onClose={() => setArchivingPhase(null)}
            onConfirm={handleArchiveSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
}

interface PhaseCardProps {
  phase: Phase;
  onEdit: () => void;
  onArchive: () => void;
  onActivate?: () => void;
  isActive: boolean;
}

function PhaseCard({ phase, onEdit, onArchive, onActivate, isActive }: PhaseCardProps) {
  return (
    <div className="card-soft">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isActive ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Archive className="w-5 h-5 text-muted-foreground" />
            )}
            <h3 className="font-bold text-foreground text-lg">{phase.name}</h3>
            {isActive && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary-light text-primary">
                Active
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <p>
              <strong>Duration:</strong> {phase.durationDays} days
            </p>
            <p>
              <strong>Started:</strong> {format(new Date(phase.startDate), "MMM d, yyyy")}
            </p>
            {phase.completedAt && (
              <p>
                <strong>Completed:</strong> {format(new Date(phase.completedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-foreground">
              <strong>Why:</strong> {phase.why}
            </p>
            <p className="text-foreground">
              <strong>Outcome:</strong> {phase.outcome}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {!isActive && onActivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActivate}
              className="whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="whitespace-nowrap"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onArchive}
              className="whitespace-nowrap text-muted-foreground hover:text-destructive"
            >
              <Archive className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

