"use client";

import { Radio } from "lucide-react";
import { useEffect, useState } from "react";

export function LiveIndicator() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/20 px-4 py-2">
      <Radio
        className={`h-4 w-4 text-red-500 transition-all duration-300 ${
          pulse ? "scale-110" : "scale-100"
        }`}
      />
      <span className="font-semibold text-red-500 text-sm">LIVE</span>
    </div>
  );
}
