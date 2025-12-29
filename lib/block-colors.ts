/**
 * Block Color System
 * 
 * Defines available colors for routine blocks across the application.
 * Colors are designed to be visually distinct and meaningful.
 */

export type BlockColor =
  | "primary"    // Teal - Default/General
  | "accent"     // Coral - Important/Urgent
  | "calm"       // Blue - Relaxation/Focus
  | "secondary"  // Yellow - Energy/Morning
  | "purple"     // Purple - Creative/Art
  | "green"      // Green - Health/Fitness
  | "orange"     // Orange - Social/Activities
  | "pink"       // Pink - Self-care/Wellness
  | "indigo"     // Indigo - Work/Productivity
  | "red";       // Red - Health/Medical

export interface ColorOption {
  id: BlockColor;
  label: string;
  class: string;
  bgLight: string;
  border: string;
  dot: string;
}

/**
 * Color options for block selection
 */
export const colorOptions: ColorOption[] = [
  {
    id: "primary",
    label: "Teal",
    class: "bg-primary",
    bgLight: "bg-primary-light",
    border: "border-primary/20",
    dot: "bg-primary",
  },
  {
    id: "accent",
    label: "Coral",
    class: "bg-accent",
    bgLight: "bg-accent/20",
    border: "border-accent/30",
    dot: "bg-accent",
  },
  {
    id: "calm",
    label: "Blue",
    class: "bg-calm",
    bgLight: "bg-calm/20",
    border: "border-calm/30",
    dot: "bg-calm",
  },
  {
    id: "secondary",
    label: "Yellow",
    class: "bg-secondary-foreground",
    bgLight: "bg-secondary",
    border: "border-secondary-foreground/10",
    dot: "bg-secondary-foreground",
  },
  {
    id: "purple",
    label: "Purple",
    class: "bg-[#A78BFA]",
    bgLight: "bg-[#A78BFA]/20",
    border: "border-[#A78BFA]/30",
    dot: "bg-[#A78BFA]",
  },
  {
    id: "green",
    label: "Green",
    class: "bg-[#34D399]",
    bgLight: "bg-[#34D399]/20",
    border: "border-[#34D399]/30",
    dot: "bg-[#34D399]",
  },
  {
    id: "orange",
    label: "Orange",
    class: "bg-[#FB923C]",
    bgLight: "bg-[#FB923C]/20",
    border: "border-[#FB923C]/30",
    dot: "bg-[#FB923C]",
  },
  {
    id: "pink",
    label: "Pink",
    class: "bg-[#F472B6]",
    bgLight: "bg-[#F472B6]/20",
    border: "border-[#F472B6]/30",
    dot: "bg-[#F472B6]",
  },
  {
    id: "indigo",
    label: "Indigo",
    class: "bg-[#818CF8]",
    bgLight: "bg-[#818CF8]/20",
    border: "border-[#818CF8]/30",
    dot: "bg-[#818CF8]",
  },
  {
    id: "red",
    label: "Red",
    class: "bg-[#F87171]",
    bgLight: "bg-[#F87171]/20",
    border: "border-[#F87171]/30",
    dot: "bg-[#F87171]",
  },
];

/**
 * Get color map for rendering blocks
 */
export function getColorMap() {
  const map: Record<BlockColor, { bg: string; border: string; dot: string }> = {} as any;
  colorOptions.forEach((color) => {
    map[color.id] = {
      bg: color.bgLight,
      border: color.border,
      dot: color.dot,
    };
  });
  return map;
}

/**
 * Get color option by ID
 */
export function getColorOption(id: BlockColor): ColorOption | undefined {
  return colorOptions.find((c) => c.id === id);
}

