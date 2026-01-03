"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { WorkshopDetails } from "@/components/features/landingpage/workshops/workshiop-details";
import type { CalculatorType } from "@/components/features/landingpage/workshops/workshops.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
