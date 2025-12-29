"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight, Calendar, Heart, RefreshCw, Lightbulb } from "lucide-react";
import { fadeUp, cardEntrance, subtleScale, prefersReducedMotion } from "@/lib/motion";

export function LandingPage() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="full" size="sm" />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <motion.h1
            initial={prefersReducedMotion() ? false : "hidden"}
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight"
          >
            Life moves in phases.
            <br />
            <span className="text-primary">Your routine should too.</span>
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion() ? false : "hidden"}
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Phaseflow helps you build routines that honor where you are right now, 
            not where you think you should be. No judgment. Just gentle structure.
          </motion.p>
          <motion.div
            initial={prefersReducedMotion() ? false : "hidden"}
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div
              whileHover={prefersReducedMotion() ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion() ? {} : { scale: 0.98 }}
            >
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start your phase
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReducedMotion() ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion() ? {} : { scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto"
              >
                See how it works
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            You've tried habit trackers. You've set goals. You've built routines. 
            And then life happened, and it all fell apart.
          </p>
          <p className="text-lg">
            But here's what most tools miss: your motivation changes. Your capacity shifts. 
            What worked last month might not fit this month. And that's not a failure—it's human.
          </p>
          <p className="text-lg">
            Routines break not because of laziness, but because they're misaligned with 
            where you actually are. When your routine doesn't match your phase, it becomes 
            a source of guilt instead of a source of support.
          </p>
        </div>
      </section>

      {/* The Phaseflow Way Section */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
          The Phaseflow Way
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: Calendar,
              iconBg: "bg-primary-light",
              iconColor: "text-primary",
              title: "One phase at a time",
              description: "Focus on a single phase—a period of time where you commit to a particular intention. No juggling multiple goals. Just one clear direction.",
            },
            {
              icon: RefreshCw,
              iconBg: "bg-accent/20",
              iconColor: "text-accent",
              title: "Routines can change",
              description: "Your routine isn't set in stone. Adjust it as life shifts. Move blocks around. Skip days when needed. The phase intention remains, even when the details change.",
            },
            {
              icon: Heart,
              iconBg: "bg-calm/20",
              iconColor: "text-calm",
              title: "Progress isn't linear",
              description: "Some days you'll show up fully. Other days, less so. That's normal. Phaseflow tracks your journey without turning missed days into moral failures.",
            },
            {
              icon: Lightbulb,
              iconBg: "bg-secondary/20",
              iconColor: "text-secondary-foreground",
              title: "Context matters",
              description: "Every phase starts with \"why\" and \"what you're hoping for.\" These anchors remind you of your intention when motivation dips. They're your gentle guide back.",
            },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={prefersReducedMotion() ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardEntrance}
                custom={index}
                className="p-6 rounded-2xl bg-card border border-border/50"
              >
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
          How It Works
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">Define your phase</h3>
              <p className="text-muted-foreground">
                Choose a duration and set your intention. What's driving this phase? 
                What are you hoping to achieve? These questions anchor everything that follows.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">Create or choose a routine</h3>
              <p className="text-muted-foreground">
                Build your daily blocks or start from a template. Schedule what matters, 
                when it matters. Keep it realistic—this isn't about perfection.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-calm/20 flex items-center justify-center text-calm font-bold text-lg">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">Adjust as life happens</h3>
              <p className="text-muted-foreground">
                When things come up, log them in your timesheet. When routines need to shift, 
                shift them. The app remembers your "why" and gently brings it back when you need it.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold text-lg">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">Reflect, not judge</h3>
              <p className="text-muted-foreground">
                When a phase ends, look back with curiosity. How close did you come? 
                What did you learn? No scoring. No pressure. Just honest reflection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Differentiation Section */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary-light/30 to-calm/20 border border-primary/10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-center">
            Why Phaseflow Feels Different
          </h2>
          <div className="space-y-6 text-muted-foreground max-w-2xl mx-auto">
            <p className="text-lg">
              Most productivity apps are built on guilt. Miss a day? You've broken your streak. 
              Skip a task? You've failed. Phaseflow is different.
            </p>
            <p className="text-lg">
              We show you supportive reminders that reference your original intention when confidence dips. 
              We respect that real life happens—timesheets capture the unexpected without judgment. 
              We don't weaponize streaks. We don't shame you for adjusting.
            </p>
            <p className="text-lg font-medium text-foreground">
              Instead, we offer reflection over pressure. Support over discipline. 
              A quiet conversation, not a sales pitch.
            </p>
          </div>
        </div>
      </section>

      {/* Invitation/CTA Section */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to begin?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start your first phase when you're ready. No pressure. You can adjust anytime.
          </p>
          <div className="pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Begin your phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-4xl mx-auto px-5 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Phaseflow. Built with care.</p>
        </div>
      </footer>
    </div>
  );
}

