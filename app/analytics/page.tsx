"use client";

import { Clock, CheckCircle2, Flame, Target } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";
import { WeeklyChart } from "@/components/analytics/WeeklyChart";
import { AppLayout } from "@/components/layout/AppLayout";

const weeklyData = [
  { day: "Mon", value: 180, maxValue: 240 },
  { day: "Tue", value: 210, maxValue: 240 },
  { day: "Wed", value: 160, maxValue: 240 },
  { day: "Thu", value: 240, maxValue: 240 },
  { day: "Fri", value: 200, maxValue: 240 },
  { day: "Sat", value: 90, maxValue: 240 },
  { day: "Sun", value: 125, maxValue: 240 },
];

const streakData = [
  { day: "Mon", value: 4, maxValue: 6 },
  { day: "Tue", value: 5, maxValue: 6 },
  { day: "Wed", value: 3, maxValue: 6 },
  { day: "Thu", value: 6, maxValue: 6 },
  { day: "Fri", value: 4, maxValue: 6 },
  { day: "Sat", value: 2, maxValue: 6 },
  { day: "Sun", value: 3, maxValue: 6 },
];

export default function Analytics() {
  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Your productivity insights</p>
        </div>

        {/* Stats Grid */}
        <div className="px-5 grid grid-cols-2 gap-4">
          <StatCard
            icon={Clock}
            label="Focus Time"
            value="18.5h"
            subtext="This week"
            color="primary"
            delay={0.1}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value="27"
            subtext="Blocks"
            color="accent"
            delay={0.15}
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value="12"
            subtext="Days"
            color="secondary"
            delay={0.2}
          />
          <StatCard
            icon={Target}
            label="Goal Rate"
            value="85%"
            subtext="Weekly avg"
            color="calm"
            delay={0.25}
          />
        </div>

        {/* Weekly Focus Chart */}
        <div className="px-5 mt-6">
          <WeeklyChart data={weeklyData} title="Focus Minutes by Day" />
        </div>

        {/* Blocks Completed Chart */}
        <div className="px-5 mt-4">
          <WeeklyChart data={streakData} title="Blocks Completed" />
        </div>

        {/* Insights Card */}
        <div className="mx-5 mt-6 card-soft">
          <h3 className="font-semibold text-foreground mb-3">💡 Insight</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're most productive on{" "}
            <span className="text-foreground font-medium">Thursdays</span>!
            Consider scheduling your most challenging tasks on that day. Your
            morning meditation habit has been consistent for 12 days — keep it
            up!
          </p>
        </div>

        {/* Encouragement */}
        <div className="mx-5 mt-4 p-6 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
          <p className="text-center text-foreground font-medium">
            You're doing great! Every small step counts. 🌱
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

