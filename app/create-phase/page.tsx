"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Target, Heart, Sparkles, Loader2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, addDays } from "date-fns";
import { TemplatePreviewModal } from "@/components/phases/TemplatePreviewModal";
import { PhaseTemplate } from "@/lib/phase-templates";

const durationOptions = [
  {
    value: 30,
    label: "30 days",
    description: "A gentle start - enough time to explore",
  },
  {
    value: 60,
    label: "60 days",
    description: "Room to settle into your rhythm",
  },
  {
    value: 90,
    label: "90 days",
    description: "A meaningful chapter of growth",
  },
];

type CreateMode = "selection" | "from-scratch" | "from-template";

export default function CreatePhase() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<CreateMode>("selection");
  const [selectedTemplate, setSelectedTemplate] = useState<PhaseTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<PhaseTemplate[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [whyStarting, setWhyStarting] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/phase-templates");
        const data = await response.json();
        if (response.ok && data.templates) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Pre-fill form when template is selected
  useEffect(() => {
    if (selectedTemplate && mode === "from-template") {
      setDuration(selectedTemplate.suggestedDuration);
      setName(selectedTemplate.name);
    }
  }, [selectedTemplate, mode]);

  const handleTemplateSelect = (template: PhaseTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = () => {
    setShowPreview(false);
    setMode("from-template");
  };

  const handleCreateFromScratch = () => {
    setMode("from-scratch");
    setName("");
    setDuration(30);
    setCustomDuration("");
    setUseCustomDuration(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Give your phase a name that resonates with you");
      return;
    }

    // Validate duration
    let finalDuration = duration;
    if (useCustomDuration) {
      const customValue = parseInt(customDuration);
      if (!customDuration || isNaN(customValue) || customValue < 1) {
        setError("Choose a duration that feels achievable - even one day counts");
        return;
      }
      finalDuration = customValue;
    }

    // Validate start date
    if (!startDate || isNaN(new Date(startDate).getTime())) {
      setError("Pick a start date - whenever feels right");
      return;
    }

    if (!whyStarting.trim()) {
      setError("Knowing your 'why' helps on harder days");
      return;
    }

    if (!expectedOutcome.trim()) {
      setError("Imagine where you'd like to be - even a small hope counts");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (mode === "from-template" && selectedTemplate) {
        // Create from template
        response = await fetch("/api/phases/from-template", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            name: name.trim(),
            durationDays: finalDuration,
            startDate,
            why: whyStarting.trim(),
            outcome: expectedOutcome.trim(),
          }),
        });
      } else {
        // Create from scratch
        response = await fetch("/api/phases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          durationDays: finalDuration,
          startDate,
          why: whyStarting.trim(),
          outcome: expectedOutcome.trim(),
        }),
      });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create phase");
        setIsLoading(false);
        return;
      }

      // Redirect based on mode
      if (mode === "from-template") {
        // Templates already have blocks cloned, go to phase board
        router.push("/phase-board");
      } else {
        // From scratch needs routine builder
    router.push("/routine-builder");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Calculate end date safely
  const getEndDate = () => {
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return null;
      const finalDuration = useCustomDuration && customDuration 
        ? parseInt(customDuration) || duration 
        : duration;
      return addDays(start, finalDuration - 1);
    } catch {
      return null;
    }
  };

  const endDate = getEndDate();

  // Template Selection Screen
  if (mode === "selection") {
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
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Create Your Phase
              </h1>
              <p className="text-sm text-muted-foreground">
                  Choose how you'd like to get started
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 space-y-6">
            {/* Create from Scratch Option */}
            <div
              onClick={handleCreateFromScratch}
              className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:bg-primary-light/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-light">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Create from Scratch
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start with a blank canvas and build your routine exactly how you envision it
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">or</span>
              </div>
            </div>

            {/* Template Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Start from a Template
                </h2>
                <p className="text-sm text-muted-foreground">
                  Get inspired by predefined routines. You can customize everything once you create your phase.
                </p>
              </div>

              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary-light/20 transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{template.suggestedDuration} days</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {template.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-primary-light text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                        className="flex-shrink-0"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          {selectedTemplate && showPreview && (
            <TemplatePreviewModal
              template={selectedTemplate}
              onClose={() => {
                setShowPreview(false);
                setSelectedTemplate(null);
              }}
              onUseTemplate={handleUseTemplate}
            />
          )}
        </div>
      </AppLayout>
    );
  }

  // Phase Creation Form (both from-scratch and from-template)
  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setMode("selection")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Create Your Phase
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "from-template" && selectedTemplate
                  ? `Starting from "${selectedTemplate.name}" template`
                  : "Design a rhythm that works for you"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Phase Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Phase Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 30-Day Focus Reset"
              className="input-soft w-full text-lg"
              required
            />
            {mode === "from-template" && selectedTemplate && (
              <p className="text-xs text-muted-foreground mt-2">
                Feel free to change this name - it's just a starting point
              </p>
            )}
          </div>

          {/* Duration Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Duration
            </label>
            <div className="space-y-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setDuration(option.value);
                    setUseCustomDuration(false);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    !useCustomDuration && duration === option.value
                      ? "bg-primary-light border-primary/30"
                      : "bg-card border-border/50 hover:border-primary/20"
                  }`}
                >
                  <p className="font-semibold text-foreground">
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </button>
              ))}
              
              {/* Custom Duration Option */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUseCustomDuration(true)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    useCustomDuration
                      ? "bg-primary-light border-primary/30"
                      : "bg-card border-border/50 hover:border-primary/20"
                  }`}
                >
                  <p className="font-semibold text-foreground">
                    Custom Duration
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Set your own duration in days
                  </p>
                </button>
                {useCustomDuration && (
                  <div className="pl-4">
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
                          setCustomDuration(value);
                        }
                      }}
                      placeholder="Enter number of days"
                      min="1"
                      className="input-soft w-full"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const value = e.target.value;
                // Only update if it's a valid date string
                if (value && !isNaN(new Date(value).getTime())) {
                  setStartDate(value);
                }
              }}
              onBlur={(e) => {
                // Validate on blur and reset if invalid
                const value = e.target.value;
                if (value && isNaN(new Date(value).getTime())) {
                  setStartDate(format(new Date(), "yyyy-MM-dd"));
                }
              }}
              className="input-soft w-full"
              required
            />
            {endDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Ends on {format(endDate, "MMMM d, yyyy")}
            </p>
            )}
          </div>

          {/* Why Starting */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Heart className="w-4 h-4" />
              What's drawing you to start this? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={whyStarting}
              onChange={(e) => setWhyStarting(e.target.value)}
              placeholder="What matters to you about this?"
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <Target className="w-4 h-4" />
              How do you hope to feel at the end? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="Imagine your future self..."
              rows={3}
              className="input-soft w-full resize-none"
              required
            />
          </div>

          {/* Encouragement Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-light to-calm/20 border border-primary/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  This is your space
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "from-template"
                    ? "The template is just a starting point. Once your phase is created, you can edit everything - blocks, times, categories - to make it truly yours."
                    : "There's no perfect way to do this. Adjust as you learn. What matters is that you've chosen to begin."}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-24">
            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Phase...
                </>
              ) : (
                "Create Phase"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
