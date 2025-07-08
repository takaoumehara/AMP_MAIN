"use client";

import { cn } from "../../lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

export interface DockProps {
  className?: string;
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, children, direction = "bottom", ...props }, ref) => {
    const mouseX = useMotionValue(Infinity);

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(
          "mx-auto flex h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-gray-900",
          {
            "items-start pt-3": direction === "top",
            "items-center py-3": direction === "middle",
            "items-end pb-3": direction === "bottom",
          },
          className,
        )}
      >
        {React.Children.map(children, (child) => {
          return React.cloneElement(child as React.ReactElement, {
            mouseX: mouseX,
          });
        })}
      </motion.div>
    );
  },
);

Dock.displayName = "Dock";

export interface DockIconProps {
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: any;
  className?: string;
  children?: React.ReactNode;
  props?: any;
}

const DockIcon = ({
  size = 40,
  magnification = 60,
  distance = 140,
  mouseX,
  className,
  children,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40],
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon }; 