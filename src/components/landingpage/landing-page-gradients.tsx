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
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="-left-32 -top-32 absolute size-[700px] rounded-full bg-gradient-to-br from-emerald-400/30 via-primary/25 to-transparent blur-[120px] dark:from-emerald-500/40 dark:via-primary/35 dark:to-transparent"
      />

      {/* Secondary gradient - top right */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="-right-32 absolute top-1/4 size-[600px] rounded-full bg-gradient-to-bl from-cyan-400/25 via-secondary/20 to-transparent blur-[110px] dark:from-cyan-500/35 dark:via-secondary/30 dark:to-transparent"
      />

      {/* Accent gradient - bottom center */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -40, 20, 0],
          x: [0, 40, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="-bottom-32 -translate-x-1/2 absolute left-1/2 size-[800px] rounded-full bg-gradient-to-t from-teal-400/20 via-accent/20 to-transparent blur-[140px] dark:from-teal-500/30 dark:via-accent/30 dark:to-transparent"
      />

      {/* Additional gradient - middle right */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -20, 15, 0],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="-right-20 absolute top-1/2 size-[500px] rounded-full bg-gradient-to-l from-green-400/20 via-emerald-500/15 to-transparent blur-[100px] dark:from-green-500/30 dark:via-emerald-600/25 dark:to-transparent"
      />
    </div>
  );
}
