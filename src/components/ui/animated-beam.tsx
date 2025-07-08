"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import React, { forwardRef, useRef } from "react";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam = forwardRef<SVGSVGElement, AnimatedBeamProps>(
  (
    {
      className,
      containerRef,
      fromRef,
      toRef,
      curvature = 0,
      reverse = false,
      duration = Math.random() * 3 + 4,
      delay = 0,
      pathColor = "gray",
      pathWidth = 2,
      pathOpacity = 0.2,
      gradientStartColor = "#ffaa40",
      gradientStopColor = "#9c40ff",
      startXOffset = 0,
      startYOffset = 0,
      endXOffset = 0,
      endYOffset = 0,
    },
    ref,
  ) => {
    const id = React.useId();
    const svgRef = useRef<SVGSVGElement>(null);
    const [pathD, setPathD] = React.useState("");
    const [svgDimensions, setSvgDimensions] = React.useState({ width: 0, height: 0 });

    // Calculate path between two elements
    const updatePath = React.useCallback(() => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlPointX = startX + (endX - startX) / 2;
        const controlPointY = startY - curvature;

        const d = `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
        setPathD(d);
      }
    }, [
      containerRef,
      fromRef,
      toRef,
      curvature,
      startXOffset,
      startYOffset,
      endXOffset,
      endYOffset,
    ]);

    React.useEffect(() => {
      updatePath();

      const resizeObserver = new ResizeObserver(() => {
        updatePath();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [updatePath]);

    return (
      <svg
        ref={svgRef}
        width={svgDimensions.width}
        height={svgDimensions.height}
        className={cn(
          "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
          className,
        )}
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      >
        <defs>
          <linearGradient
            className={cn("transform-gpu")}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1="0%"
            x2="8%"
            y1="0"
            y2="0"
          >
            <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
            <stop stopColor={gradientStartColor}></stop>
            <stop offset="32.5%" stopColor={gradientStopColor}></stop>
            <stop
              offset="100%"
              stopColor={gradientStopColor}
              stopOpacity="0"
            ></stop>
          </linearGradient>
        </defs>
        <motion.path
          d={pathD}
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeOpacity={pathOpacity}
          fill="none"
        />
        <motion.path
          d={pathD}
          stroke={`url(#${id})`}
          strokeWidth={pathWidth}
          strokeOpacity="1"
          fill="none"
          strokeLinecap="round"
          initial={{
            strokeDasharray: "0 1",
          }}
          animate={{
            strokeDasharray: ["0 1", "1 0"],
          }}
          transition={{
            duration,
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      </svg>
    );
  },
);

AnimatedBeam.displayName = "AnimatedBeam"; 