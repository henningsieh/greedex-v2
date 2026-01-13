"use client";

import { motion } from "motion/react";

/**
 * Landing page gradient backgrounds
 * Provides animated gradient orbs that work in both light and dark modes
 */
export function LandingPageGradients() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Primary gradient - top left */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 15, -10, 0],
          x: [0, 30, -20, 0],
        }}
        className="absolute -top-32 -left-32 size-175 rounded-full bg-linear-to-br from-emerald-400/30 via-primary/25 to-transparent blur-[120px] dark:from-emerald-500/40 dark:via-primary/35 dark:to-transparent"
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Secondary gradient - top right */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
        }}
        className="absolute top-1/4 -right-32 size-150 rounded-full bg-linear-to-bl from-cyan-400/25 via-secondary/20 to-transparent blur-[110px] dark:from-cyan-500/35 dark:via-secondary/30 dark:to-transparent"
        transition={{
          duration: 28,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Accent gradient - bottom center */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -40, 20, 0],
          x: [0, 40, -30, 0],
        }}
        className="absolute -bottom-32 left-1/2 size-200 -translate-x-1/2 rounded-full bg-linear-to-t from-teal-400/20 via-accent/20 to-transparent blur-[140px] dark:from-teal-500/30 dark:via-accent/30 dark:to-transparent"
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Additional gradient - middle right */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -20, 15, 0],
        }}
        className="absolute top-1/2 -right-20 size-125 rounded-full bg-linear-to-l from-green-400/20 via-emerald-500/15 to-transparent blur-[100px] dark:from-green-500/30 dark:via-emerald-600/25 dark:to-transparent"
        transition={{
          duration: 26,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
