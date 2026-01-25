"use client";

import createGlobe from "cobe";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { CityLocation } from "@/lib/i18n/eu-cities";

export interface GlobeProps {
  className?: string;
  cities?: CityLocation[];
  width?: number;
  height?: number;
  phi?: number;
  theta?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Array<{ location: [number, number]; size: number }>;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

/**
 * Globe component using Cobe library
 * Displays an interactive 3D globe with customizable markers and styling
 * 
 * @param className - Optional CSS classes
 * @param cities - Array of city locations to display as markers
 * @param width - Canvas width in pixels (default: 600)
 * @param height - Canvas height in pixels (default: 600)
 * @param phi - Initial vertical rotation (default: 0)
 * @param theta - Initial horizontal rotation (default: 0.3)
 * @param dark - Darkness level 0-1 (default: 0 for light, 1 for dark)
 * @param diffuse - Diffuse lighting 0-3 (default: 0.8)
 * @param mapSamples - Map detail samples (default: 20000)
 * @param mapBrightness - Map brightness 0-10 (default: 6)
 * @param baseColor - RGB color for globe base
 * @param markerColor - RGB color for city markers
 * @param glowColor - RGB color for glow effect
 * @param markers - Custom markers array (overrides cities if provided)
 * @param autoRotate - Enable auto-rotation (default: true)
 * @param autoRotateSpeed - Rotation speed (default: 0.002)
 */
export function Globe({
  className = "",
  cities = [],
  width = 600,
  height = 600,
  phi = 0,
  theta = 0.3,
  dark,
  diffuse = 0.8,
  mapSamples = 20000,
  mapBrightness = 6,
  baseColor,
  markerColor,
  glowColor,
  markers: customMarkers,
  autoRotate = true,
  autoRotateSpeed = 0.002,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(phi);
  const { theme, resolvedTheme } = useTheme();
  
  // Determine if we're in dark mode
  const isDark = theme === "dark" || resolvedTheme === "dark";
  
  // Use dark prop if provided, otherwise use theme
  const effectiveDark = dark !== undefined ? dark : isDark ? 1 : 0;
  
  // Default colors based on theme
  const defaultBaseColor: [number, number, number] = isDark 
    ? [0.1, 0.4, 0.3] // Dark mode: darker teal
    : [0.8, 0.95, 0.9]; // Light mode: very light teal
    
  const defaultMarkerColor: [number, number, number] = isDark
    ? [0.2, 0.9, 0.6] // Dark mode: bright emerald
    : [0.15, 0.65, 0.4]; // Light mode: medium green
    
  const defaultGlowColor: [number, number, number] = isDark
    ? [0.1, 0.5, 0.3] // Dark mode: emerald glow
    : [0.7, 0.9, 0.8]; // Light mode: soft teal glow

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!autoRotate) return;
      
      // Auto-rotate
      phiRef.current += autoRotateSpeed;
      state.phi = phiRef.current;
    },
    [autoRotate, autoRotateSpeed]
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    // Convert cities to markers format
    const cityMarkers = customMarkers || cities.map((city) => ({
      location: [city.latitude, city.longitude] as [number, number],
      size: city.size || 0.08,
    }));

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: height * 2,
      phi: phi,
      theta: theta,
      dark: effectiveDark,
      diffuse: diffuse,
      mapSamples: mapSamples,
      mapBrightness: mapBrightness,
      baseColor: baseColor || defaultBaseColor,
      markerColor: markerColor || defaultMarkerColor,
      glowColor: glowColor || defaultGlowColor,
      markers: cityMarkers,
      onRender: onRender,
    });

    return () => {
      globe.destroy();
    };
  }, [
    cities,
    customMarkers,
    width,
    height,
    phi,
    theta,
    effectiveDark,
    diffuse,
    mapSamples,
    mapBrightness,
    baseColor,
    markerColor,
    glowColor,
    defaultBaseColor,
    defaultMarkerColor,
    defaultGlowColor,
    onRender,
  ]);

  return (
    <div className={className} role="img" aria-label="Interactive 3D globe showing EU member states and capital cities">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          width: width,
          height: height,
          maxWidth: "100%",
          aspectRatio: "1",
        }}
      />
    </div>
  );
}
