"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Repeat, Bell, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { colorOptions, type BlockColor } from "@/lib/block-colors";

const durationOptions = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
  "2 hours",
];

export default function CreateBlock() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<BlockColor>("primary");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [startTime, setStartTime] = useState("09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      // In real app, show toast error
      return;
    }

    // In real app, create block via API
    router.push("/today");
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Create Block</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Block Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="input-soft w-full text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the purpose of this block?"
              rows={3}
              className="input-soft w-full resize-none"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Color Label
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-12 h-12 rounded-xl ${color.class} transition-all ${
                    selectedColor === color.id
                      ? "ring-2 ring-offset-2 ring-foreground/20 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-soft w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="input-soft w-full"
              >
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Repeat */}
          <div className="card-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Repeat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Repeat</p>
                <p className="text-sm text-muted-foreground">Every day</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Change
            </Button>
          </div>

          {/* Reminder */}
          <div className="card-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Reminder</p>
                <p className="text-sm text-muted-foreground">5 min before</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Change
            </Button>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-24">
            <Button type="submit" size="xl" className="w-full">
              Create Block
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

