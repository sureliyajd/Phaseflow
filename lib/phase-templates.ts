/**
 * Phase Template System
 * 
 * Predefined phase templates that users can choose from to get started quickly.
 * Templates are read-only and serve as inspiration for creating new phases.
 */

export type WeekendHandling = "include" | "exclude";

export interface PhaseTemplateBlock {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  title: string;
  category: string;
  note?: string;
}

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  suggestedDuration: number; // days
  weekendHandling: WeekendHandling;
  tags: string[];
  blocks: PhaseTemplateBlock[];
}

/**
 * Predefined Phase Templates
 * These templates serve as starting points that users can customize.
 */
export const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    id: "morning-focus",
    name: "Morning Focus",
    description: "A structured morning routine to start your day with intention and clarity",
    suggestedDuration: 30,
    weekendHandling: "include",
    tags: ["Focus", "Productivity", "Morning"],
    blocks: [
      {
        startTime: "06:30",
        endTime: "07:00",
        title: "Wake Up & Hydrate",
        category: "Self Care",
        note: "Glass of water, gentle stretching",
      },
      {
        startTime: "07:00",
        endTime: "07:30",
        title: "Meditation or Journaling",
        category: "Mindfulness",
        note: "Set intentions for the day",
      },
      {
        startTime: "07:30",
        endTime: "08:00",
        title: "Morning Exercise",
        category: "Fitness",
        note: "Light workout or walk",
      },
      {
        startTime: "08:00",
        endTime: "08:30",
        title: "Breakfast & Preparation",
        category: "Self Care",
      },
      {
        startTime: "08:30",
        endTime: "09:00",
        title: "Review Today's Priorities",
        category: "Planning",
        note: "Top 3 tasks for the day",
      },
    ],
  },
  {
    id: "work-life-balance",
    name: "Work-Life Balance",
    description: "Balance focused work with rest and personal time throughout your day",
    suggestedDuration: 60,
    weekendHandling: "exclude",
    tags: ["Balance", "Work", "Wellness"],
    blocks: [
      {
        startTime: "08:00",
        endTime: "09:00",
        title: "Morning Routine",
        category: "Self Care",
        note: "Personal time before work",
      },
      {
        startTime: "09:00",
        endTime: "12:00",
        title: "Deep Work Block",
        category: "Work",
        note: "Focus on important tasks",
      },
      {
        startTime: "12:00",
        endTime: "13:00",
        title: "Lunch Break",
        category: "Self Care",
        note: "Step away from screen",
      },
      {
        startTime: "13:00",
        endTime: "16:00",
        title: "Collaboration & Meetings",
        category: "Work",
      },
      {
        startTime: "16:00",
        endTime: "17:00",
        title: "Wrap Up & Planning",
        category: "Planning",
        note: "Review tomorrow's priorities",
      },
      {
        startTime: "18:00",
        endTime: "19:00",
        title: "Evening Activity",
        category: "Personal",
        note: "Hobby, exercise, or social time",
      },
      {
        startTime: "20:00",
        endTime: "21:00",
        title: "Wind Down",
        category: "Self Care",
        note: "Reading, tea, relaxation",
      },
    ],
  },
  {
    id: "fitness-foundation",
    name: "Fitness Foundation",
    description: "Build a consistent exercise routine that fits into your schedule",
    suggestedDuration: 30,
    weekendHandling: "include",
    tags: ["Fitness", "Health", "Consistency"],
    blocks: [
      {
        startTime: "07:00",
        endTime: "07:30",
        title: "Morning Movement",
        category: "Fitness",
        note: "Yoga, stretching, or light cardio",
      },
      {
        startTime: "12:30",
        endTime: "13:00",
        title: "Midday Walk",
        category: "Fitness",
        note: "10-15 minute walk outside",
      },
      {
        startTime: "18:00",
        endTime: "19:00",
        title: "Main Workout",
        category: "Fitness",
        note: "Strength, cardio, or sport",
      },
      {
        startTime: "19:00",
        endTime: "19:30",
        title: "Post-Workout Recovery",
        category: "Self Care",
        note: "Stretching, hydration",
      },
    ],
  },
  {
    id: "creative-flow",
    name: "Creative Flow",
    description: "Carve out dedicated time for creative projects and expression",
    suggestedDuration: 30,
    weekendHandling: "include",
    tags: ["Creative", "Passion", "Art"],
    blocks: [
      {
        startTime: "09:00",
        endTime: "10:30",
        title: "Creative Block",
        category: "Creative",
        note: "Work on your project",
      },
      {
        startTime: "19:00",
        endTime: "20:30",
        title: "Evening Creative Time",
        category: "Creative",
        note: "Experiment, practice, or explore",
      },
      {
        startTime: "20:30",
        endTime: "21:00",
        title: "Reflection",
        category: "Mindfulness",
        note: "Note what you learned or created",
      },
    ],
  },
  {
    id: "mindful-living",
    name: "Mindful Living",
    description: "Incorporate mindfulness and self-reflection into your daily rhythm",
    suggestedDuration: 30,
    weekendHandling: "include",
    tags: ["Mindfulness", "Balance", "Wellness"],
    blocks: [
      {
        startTime: "07:00",
        endTime: "07:20",
        title: "Morning Meditation",
        category: "Mindfulness",
        note: "5-15 minutes",
      },
      {
        startTime: "12:00",
        endTime: "12:15",
        title: "Mindful Lunch",
        category: "Mindfulness",
        note: "Eat without distractions",
      },
      {
        startTime: "17:00",
        endTime: "17:15",
        title: "Afternoon Pause",
        category: "Mindfulness",
        note: "Brief breathing exercise",
      },
      {
        startTime: "20:00",
        endTime: "20:30",
        title: "Evening Reflection",
        category: "Mindfulness",
        note: "Journaling or gratitude practice",
      },
    ],
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): PhaseTemplate | undefined {
  return PHASE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): PhaseTemplate[] {
  return PHASE_TEMPLATES;
}

