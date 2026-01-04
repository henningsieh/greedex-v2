"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { WorkshopDetails } from "@/components/features/landingpage/workshops/workshop-details";
import type { CalculatorType } from "@/components/features/landingpage/workshops/workshops.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Render a three-tab workshop interface synchronized with the URL `type` query parameter.
 *
 * The selected tab is derived from the `type` query parameter and falls back to `initialType`
 * when the query parameter is absent or invalid.
 *
 * @param initialType - Default calculator type to use when the `type` query parameter is not present
 * @returns A React element that renders tabbed workshop details for the selected calculator type
 */
export function WorkshopContent({
  initialType,
}: {
  initialType: CalculatorType;
}) {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(["moment", "deal", "day"] as const).withDefault(
      initialType,
    ),
  );

  return (
    <Tabs
      onValueChange={(value) => setType(value as CalculatorType)}
      value={type}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="moment">Greendex Moment</TabsTrigger>
        <TabsTrigger value="deal">Greendex Deal</TabsTrigger>
        <TabsTrigger value="day">Greendex Day</TabsTrigger>
      </TabsList>

      <TabsContent className="mt-8" value="moment">
        <WorkshopDetails type="moment" />
      </TabsContent>

      <TabsContent className="mt-8" value="deal">
        <WorkshopDetails type="deal" />
      </TabsContent>

      <TabsContent className="mt-8" value="day">
        <WorkshopDetails type="day" />
      </TabsContent>
    </Tabs>
  );
}
