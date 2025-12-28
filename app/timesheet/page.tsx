"use client";

import { useState } from "react";
import { Play, Pause, Square, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

interface TimeEntry {
  id: string;
  title: string;
  duration: string;
  startTime: string;
  endTime: string;
  color: "primary" | "accent" | "calm" | "secondary";
}

// Mock data
const mockEntries: TimeEntry[] = [
  {
    id: "1",
    title: "Morning Meditation",
    duration: "15:00",
    startTime: "7:00 AM",
    endTime: "7:15 AM",
    color: "calm",
  },
  {
    id: "2",
    title: "Deep Work Session",
    duration: "1:32:45",
    startTime: "9:00 AM",
    endTime: "10:32 AM",
    color: "primary",
  },
  {
    id: "3",
    title: "Exercise",
    duration: "45:00",
    startTime: "12:30 PM",
    endTime: "1:15 PM",
    color: "accent",
  },
];

const colorMap = {
  primary: "bg-primary-light border-primary/20",
  accent: "bg-accent/20 border-accent/30",
  calm: "bg-calm/20 border-calm/30",
  secondary: "bg-secondary border-secondary-foreground/10",
};

const dotColorMap = {
  primary: "bg-primary",
  accent: "bg-accent",
  calm: "bg-calm",
  secondary: "bg-secondary-foreground",
};

export default function Timesheet() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [currentTask, setCurrentTask] = useState("");

  const totalMinutes = 152; // Mock total
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Timesheet</h1>
          <p className="text-muted-foreground mt-1">Track your focus time</p>
        </div>

        {/* Timer Card */}
        <div className="mx-5 card-soft">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-foreground font-mono tracking-tight">
              {currentTime}
            </div>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you working on?"
              className="mt-4 w-full text-center bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isTimerRunning ? "accent" : "default"}
              size="lg"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-14 h-14 rounded-2xl"
            >
              {isTimerRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            {isTimerRunning && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setIsTimerRunning(false);
                  setCurrentTime("00:00:00");
                }}
                className="w-14 h-14 rounded-2xl"
              >
                <Square className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="mx-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Today's Total
            </h2>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">
                {hours}h {minutes}m
              </span>
            </div>
          </div>

          {/* Time Entries */}
          <div className="space-y-3">
            {mockEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border ${colorMap[entry.color]} transition-all duration-200`}
                style={{
                  animationDelay: `${300 + index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${dotColorMap[entry.color]}`}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.startTime} - {entry.endTime}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    {entry.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Entry Button */}
          <Button variant="outline" className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Manual Entry
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

