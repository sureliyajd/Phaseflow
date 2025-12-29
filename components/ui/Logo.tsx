"use client";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ variant = "full", size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "h-8 w-8", logo: "h-8", maxLogo: "max-w-[120px]", text: "text-lg" },
    md: { icon: "h-10 w-10", logo: "h-10", maxLogo: "max-w-[150px]", text: "text-xl" },
    lg: { icon: "h-16 w-16", logo: "h-16", maxLogo: "max-w-[200px]", text: "text-2xl" },
  };

  const currentSize = sizeClasses[size];

  // Icon variant: just the icon image
  if (variant === "icon") {
    return (
      <div className={className}>
        <img
          src="/phaseflow-icon.png"
          alt="Phaseflow"
          className={`${currentSize.icon} object-contain`}
        />
      </div>
    );
  }

  // Text variant: just the text
  if (variant === "text") {
    return (
      <span className={`font-bold text-foreground ${currentSize.text} ${className}`}>
        Phaseflow
      </span>
    );
  }

  // Full variant: use the full logo image (which includes both icon and text)
  // The logo has a wide aspect ratio (1280x369), so we maintain aspect ratio
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img
        src="/phaseflow-logo.png"
        alt="Phaseflow"
        className={`${currentSize.logo} ${currentSize.maxLogo} w-auto object-contain`}
        style={{ display: "block" }}
      />
    </div>
  );
}

