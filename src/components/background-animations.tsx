"use client";

import { motion } from "motion/react";

export function BackgroundAnimations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
        }}
        className="absolute -top-32 -left-20 h-125 w-125 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/10"
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        className="absolute top-1/4 -right-20 h-100 w-100 rounded-full bg-secondary/20 blur-[100px] dark:bg-secondary/10"
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -50, 0],
        }}
        className="absolute -bottom-32 left-1/2 h-150 w-150 -translate-x-1/2 rounded-full bg-accent/20 blur-[140px] dark:bg-accent/10"
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
