/**
 * @file Live view dashboard (mock/click-dummy)
 *
 * @description
 * This page is a click-dummy "live view" dashboard implemented with fully mocked data and
 * fake type definitions for demo and requirements-spec purposes. It intentionally:
 * - Runs on the client ("use client") and uses generated mock Participants/activities.
 * - Uses a local mock data generator instead of real backend data fetching.
 * - Contains placeholder/fake type information and CO2 factors used only for demonstration.
 *
 * IMPORTANT: This is NOT production code. It is a demonstration scaffold showing layout,
 * interaction patterns, and the intended UX for a live project-responsible view where
 * participant activities stream into the UI.
 *
 * Use case
 * - Primary audience: the project's responsible person (admin/owner) who watches incoming
 *   projectActivities in near real-time to monitor participation, stats and leaderboard.
 * - Behavior: show live updates to participants, recalculate project stats, show a
 *   leaderboard and transport breakdown as new activities arrive.
 *
 * Socket / WebSocket / Socket.IO
 * - The Socket.IO-based real-time push is planned for this page. A proof-of-concept Socket.IO
 *   implementation exists at: /socket-test/page.tsx — use that as the reference for:
 *   - Establishing a socket connection from the browser
 *   - Subscribing to project-specific channels/rooms
 *   - Receiving server-pushed activity events
 * - Integration notes (to replace the mock interval):
 *   - Replace the mock generator/interval with a Socket.IO client connection.
 *   - Authenticate the socket (token/cookie) before subscribing to project channels.
 *   - Listen for events such as "activity:created" or "project:update" and apply
 *     immutable updates to React state (avoid mutating arrays in-place).
 *   - Recalculate stats after each event using the calculateStats function (or a more
 *     optimised reducer) and debounce/coalesce events if necessary.
 *   - Ensure proper cleanup: disconnect socket and remove listeners on unmount.
 *
 * Migration TODOs (Mock -> Real)
 * - Replace generateMockData() with a server fetch for initial snapshot (REST or RPC).
 * - Replace interval-based mutation with socket event handlers.
 * - Replace fake types/CO2 constants with canonical shared types from the backend schema.
 * - Introduce optimistic UI updates if users submit activities from the same client.
 * - Add error handling, reconnection/backoff strategy and telemetry for socket events.
 *
 * Security & Privacy
 * - Validate and normalise all incoming socket messages on the client; do not trust
 *   unverified data. Prefer the server to validate and sanitise before emitting.
 * - Ensure authentication/authorization so only authorised viewers can subscribe to
 *   a project's live feed.
 * - Avoid sending or persisting unnecessary PII; mask or omit sensitive fields.
 *
 * Remarks
 * - This file intentionally signals to AI agents and developers that it is a mocked
 *   click-dummy demonstrating the UI and interaction requirements. Do not treat the
 *   current mock implementations (fake types, CO2 factors, random mock generator)
 *   as production-quality logic.
 *
 * @see /socket-test/page.tsx - Proof-of-concept Socket.IO server push implementation
 *
 * @todo
 * - Implement authenticated Socket.IO client wiring here using the PoC as a guide.
 * - Replace mocks with real types and initial server snapshot fetching.
 * - Harden against malformed events and implement reconnection/backoff.
 */
"use client";

/**
 * This is the click dummy dashboard page for demo and showing purpose and reqirements.
 * In a real production app, data would be fetched with tanstack query and orpc methods.
 * Real-time updates would be handled via WebSockets.
 */

import { MapPinnedIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/participate/leaderboard";
import { LiveIndicator } from "@/components/participate/live-indicator";
import { StatsOverview } from "@/components/participate/stats-overview";
import { TransportBreakdown } from "@/components/participate/transport-breakdown";
import {
  activityTypeValues,
  CO2_FACTORS,
  type Participant,
  type ProjectStats,
} from "@/components/participate/types";

/**
 * Demo mock data generator
 */
function generateMockData(): Participant[] {
  const names = [
    "Emma Schmidt",
    "Lucas Dubois",
    "Sofia Rossi",
    "Miguel Santos",
    "Anna Kowalski",
    "Jonas Nielsen",
    "Maria Garcia",
    "Lukas Müller",
    "Elena Popescu",
    "Dimitri Ivanov",
    "Chiara Bianchi",
    "Oscar Andersson",
  ];

  const countries = [
    "Germany",
    "France",
    "Italy",
    "Portugal",
    "Poland",
    "Denmark",
    "Spain",
    "Austria",
    "Romania",
    "Bulgaria",
    "Italy",
    "Sweden",
  ];

  return names.map((name, index) => {
    const numActivities = Math.floor(Math.random() * 3) + 1;
    const activities = Array.from(
      {
        length: numActivities,
      },
      (_, i) => {
        const type =
          activityTypeValues[
            Math.floor(Math.random() * activityTypeValues.length)
          ];
        const distanceKm = Math.floor(Math.random() * 1500) + 100;
        const co2Kg = distanceKm * CO2_FACTORS[type];

        return {
          id: `${index}-${i}`,
          type,
          distanceKm,
          co2Kg,
        };
      },
    );

    const totalCO2 = activities.reduce(
      (sum, activity) => sum + activity.co2Kg,
      0,
    );

    return {
      id: `participant-${index}`,
      name,
      country: countries[index],
      totalCO2,
      activities,
    };
  });
}

function calculateStats(participants: Participant[]): ProjectStats {
  const totalParticipants = participants.length;
  const totalCO2 = participants.reduce((sum, p) => sum + p.totalCO2, 0);
  const averageCO2 = totalParticipants > 0 ? totalCO2 / totalParticipants : 0;

  const breakdownByType = activityTypeValues.reduce(
    (acc, type) => {
      acc[type] = {
        distance: 0,
        co2: 0,
        count: 0,
      };
      return acc;
    },
    {} as ProjectStats["breakdownByType"],
  );

  participants.forEach((participant) => {
    participant.activities.forEach((activity) => {
      breakdownByType[activity.type].distance += activity.distanceKm;
      breakdownByType[activity.type].co2 += activity.co2Kg;
      breakdownByType[activity.type].count += 1;
    });
  });

  // Average tree absorbs ~22kg CO₂/year, ~1000kg in lifetime (45 years)
  const treesNeeded = Math.ceil(totalCO2 / 1000);

  return {
    totalParticipants,
    totalCO2,
    averageCO2,
    breakdownByType,
    treesNeeded,
  };
}

export default function Dashboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const initialData = generateMockData();
    setParticipants(initialData);
    setStats(calculateStats(initialData));
  }, []);

  // Simulate real-time updates (in production, this would be WebSocket/Socket.IO)
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants((prev) => {
        // Randomly update one participant's data to simulate new form submission
        const newParticipants = [...prev];
        const randomIndex = Math.floor(Math.random() * newParticipants.length);
        const participant = newParticipants[randomIndex];

        // Add a new activity
        const type =
          activityTypeValues[
            Math.floor(Math.random() * activityTypeValues.length)
          ];
        const distanceKm = Math.floor(Math.random() * 500) + 50;
        const co2Kg = distanceKm * CO2_FACTORS[type];

        participant.activities.push({
          id: `${Date.now()}`,
          type,
          distanceKm,
          co2Kg,
        });

        // Cap activities at 50 per participant to prevent memory leak in mock data
        if (participant.activities.length > 50) {
          participant.activities = participant.activities.slice(-50);
        }

        participant.totalCO2 = participant.activities.reduce(
          (sum, a) => sum + a.co2Kg,
          0,
        );

        return newParticipants;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Recalculate stats when participants change
  useEffect(() => {
    if (participants.length > 0) {
      setStats(calculateStats(participants));
    }
  }, [participants]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div className="relative">
        {/* Header */}
        <div className="sticky top-0 z-10 border-primary/20 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800">
                  <MapPinnedIcon className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="font-bold text-3xl text-foreground">
                    Mock Project Name
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Project's welcome message or tagline goes here
                  </p>
                </div>
              </div>
              <LiveIndicator />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto space-y-8 px-4 py-8">
          {/* Stats Overview */}
          <StatsOverview stats={stats} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Leaderboard - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Leaderboard participants={participants} />
            </div>

            {/* Transport Breakdown */}
            <div className="lg:col-span-1">
              <TransportBreakdown stats={stats} />
            </div>
          </div>

          {/* Footer Message */}
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              🌱 Together we're creating a greener future • Every journey counts •
              Plant trees, offset carbon
            </p>
          </div>
        </div>
      </div>
      ;
    </div>
  );
}
