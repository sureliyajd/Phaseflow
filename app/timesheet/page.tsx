"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Plus, X, Edit2, Trash2, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval, isToday } from "date-fns";

interface TimesheetEntry {
  id: string;
  title: string;
  note: string | null;
  startTime: string;
  endTime: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  date: string;
  createdAt: string;
}

interface Phase {
  id: string;
  name: string;
  why?: string;
  outcome?: string;
}

const priorityColors = {
  HIGH: { bg: "bg-accent/20", border: "border-accent/30", dot: "bg-accent" },
  MEDIUM: { bg: "bg-primary-light", border: "border-primary/20", dot: "bg-primary" },
  LOW: { bg: "bg-secondary/30", border: "border-secondary/40", dot: "bg-secondary-foreground" },
};

export default function Timesheet() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimesheetHeavy, setIsTimesheetHeavy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:00");
  const [formTitle, setFormTitle] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formPriority, setFormPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch entries for current month
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const monthStart = startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        const monthEnd = endOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));

        const response = await fetch(
          `/api/timesheet/entries?startDate=${format(monthStart, "yyyy-MM-dd")}&endDate=${format(monthEnd, "yyyy-MM-dd")}`
        );
        const data = await response.json();

        if (response.ok) {
          setEntries(data.entries || []);
          setPhase(data.phase);
          setIsTimesheetHeavy(data.isTimesheetHeavy || false);
        } else {
          console.error("Error fetching entries:", data.error);
          setEntries([]);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [selectedDate]);

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = format(parseISO(entry.date), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, TimesheetEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const resetForm = () => {
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormStartTime("09:00");
    setFormEndTime("10:00");
    setFormTitle("");
    setFormNote("");
    setFormPriority("MEDIUM");
    setFormError("");
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingEntry
        ? `/api/timesheet/entries/${editingEntry.id}`
        : "/api/timesheet/entries";
      const method = editingEntry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          title: formTitle.trim(),
          note: formNote.trim() || null,
          priority: formPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Failed to save entry");
        setIsSaving(false);
        return;
      }

      resetForm();
      // Refetch entries
      const monthStart = startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      const monthEnd = endOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
      const refetchResponse = await fetch(
        `/api/timesheet/entries?startDate=${format(monthStart, "yyyy-MM-dd")}&endDate=${format(monthEnd, "yyyy-MM-dd")}`
      );
      const refetchData = await refetchResponse.json();
      if (refetchResponse.ok) {
        setEntries(refetchData.entries || []);
        setPhase(refetchData.phase);
        setIsTimesheetHeavy(refetchData.isTimesheetHeavy || false);
      }
    } catch (error) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Delete this entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/timesheet/entries/${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete entry");
        return;
      }

      // Refetch entries
      const monthStart = startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      const monthEnd = endOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
      const refetchResponse = await fetch(
        `/api/timesheet/entries?startDate=${format(monthStart, "yyyy-MM-dd")}&endDate=${format(monthEnd, "yyyy-MM-dd")}`
      );
      const refetchData = await refetchResponse.json();
      if (refetchResponse.ok) {
        setEntries(refetchData.entries || []);
        setPhase(refetchData.phase);
        setIsTimesheetHeavy(refetchData.isTimesheetHeavy || false);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleEdit = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setFormDate(format(parseISO(entry.date), "yyyy-MM-dd"));
    setFormStartTime(entry.startTime);
    setFormEndTime(entry.endTime);
    setFormTitle(entry.title);
    setFormNote(entry.note || "");
    setFormPriority(entry.priority);
    setShowAddForm(true);
  };

  // Calculate today's total
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayEntries = groupedEntries[todayKey] || [];
  const todayTotalMinutes = todayEntries.reduce((total, entry) => {
    const start = entry.startTime.split(":").map(Number);
    const end = entry.endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return total + (endMinutes - startMinutes);
  }, 0);
  const todayHours = Math.floor(todayTotalMinutes / 60);
  const todayMinutes = todayTotalMinutes % 60;

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Timesheet</h1>
          <p className="text-muted-foreground mt-1">
            Life happens. This is space to capture it without guilt.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !phase ? (
          <div className="px-5 text-center py-12">
            <p className="text-muted-foreground mb-2">Start a phase to begin logging</p>
            <Link href="/create-phase">
              <Button variant="outline">Create one when ready</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Today's Summary */}
            {todayEntries.length > 0 && (
              <div className="mx-5 mb-6">
                <div className="card-soft p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Total</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {todayHours > 0 ? `${todayHours}h ` : ""}
                        {todayMinutes}m
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timesheet-Heavy Day Reminder */}
            {isTimesheetHeavy && phase?.why && (
              <div className="mx-5 mb-6 p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-sm text-foreground">
                  Life's been full today. That's normal. This phase is about {phase.why.toLowerCase()} — 
                  your intention still matters, even when days don't go as planned.
                </p>
              </div>
            )}

            {/* Add Entry Form */}
            {showAddForm && (
              <div className="mx-5 mb-6">
                <div className="card-soft p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      {editingEntry ? "Edit Entry" : "New Entry"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={resetForm}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">{formError}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="input-soft w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formStartTime}
                          onChange={(e) => setFormStartTime(e.target.value)}
                          className="input-soft w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formEndTime}
                          onChange={(e) => setFormEndTime(e.target.value)}
                          className="input-soft w-full"
                          required
                        />
                      </div>
            </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Title
                      </label>
            <input
              type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="What came up?"
                        className="input-soft w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Note (optional)
                      </label>
                      <textarea
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder="Add context if helpful..."
                        rows={2}
                        className="input-soft w-full resize-none"
            />
          </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Importance of this life event
                      </label>
                      <div className="flex gap-2">
                        {(["HIGH", "MEDIUM", "LOW"] as const).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setFormPriority(priority)}
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              formPriority === priority
                                ? priorityColors[priority].bg + " border-2 " + priorityColors[priority].border
                                : "bg-muted border-2 border-transparent"
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
            <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
              ) : (
                          editingEntry ? "Update" : "Add Entry"
              )}
            </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Entries List */}
            {sortedDates.length === 0 && !showAddForm ? (
              <div className="px-5 text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nothing logged yet. Whenever something comes up, note it here — it helps you see the full picture.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
              </Button>
          </div>
            ) : (
              <div className="px-5 space-y-6">
                {sortedDates.map((dateKey) => {
                  const dateEntries = groupedEntries[dateKey];
                  const date = parseISO(dateKey);
                  const isTodayDate = isToday(date);

                  return (
                    <div key={dateKey}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">
                          {isTodayDate ? "Today" : format(date, "EEEE, MMMM d")}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          ({dateEntries.length} {dateEntries.length === 1 ? "entry" : "entries"})
              </span>
          </div>

                      <div className="space-y-2">
                        {dateEntries.map((entry) => {
                          const colors = priorityColors[entry.priority];
                          return (
              <div
                key={entry.id}
                              className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}
              >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                    <div
                                    className={`w-3 h-3 rounded-full mt-1.5 ${colors.dot}`}
                    />
                                  <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {entry.title}
                      </p>
                                    {entry.note && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {entry.note}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                      </span>
                                      <span>·</span>
                                      <span>{calculateDuration(entry.startTime, entry.endTime)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(entry)}
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleDelete(entry.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {/* Add Entry Button */}
            {!showAddForm && (
              <div className="fixed bottom-24 right-5 md:relative md:bottom-auto md:right-auto md:px-5 md:mt-6">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="w-14 h-14 rounded-2xl shadow-elevated md:w-full md:h-auto"
                >
                  <Plus className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">Add Entry</span>
          </Button>
        </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
