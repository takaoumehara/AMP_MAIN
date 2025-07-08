"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import React, { useId } from "react";

export interface SparklesProps {
  className?: string;
  color?: string;
  count?: number;
  speed?: "slow" | "medium" | "fast";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
}

const Sparkles = ({
  className,
  color = "#FFC107",
  count = 50,
  speed = "medium",
  size = "medium",
  children,
  ...props
}: SparklesProps) => {
  const id = useId();
  
  const sparkleSize = {
    small: { min: 1, max: 3 },
    medium: { min: 2, max: 5 },
    large: { min: 3, max: 7 },
  };

  const sparkleSpeed = {
    slow: { min: 2, max: 4 },
    medium: { min: 1, max: 3 },
    fast: { min: 0.5, max: 2 },
  };

  const sparkles = Array.from({ length: count }, (_, i) => {
    const sizeRange = sparkleSize[size];
    const speedRange = sparkleSpeed[speed];
    
    return {
      id: i,
      size: Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      animationDuration: Math.random() * (speedRange.max - speedRange.min) + speedRange.min,
    };
  });

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: color,
            borderRadius: "50%",
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.animationDuration,
            repeat: Infinity,
            delay: sparkle.animationDelay,
            ease: "easeInOut",
          }}
        />
      ))}
      {children}
    </div>
  );
};

Sparkles.displayName = "Sparkles";

export { Sparkles }; 