"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { WorkshopDetails } from "@/components/landingpage/workshops/workshiop-details";
import type { CalculatorType } from "@/components/landingpage/workshops/workshops.config";
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
      value={type}
      onValueChange={(value) => setType(value as CalculatorType)}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="moment">Greendex Moment</TabsTrigger>
        <TabsTrigger value="deal">Greendex Deal</TabsTrigger>
        <TabsTrigger value="day">Greendex Day</TabsTrigger>
      </TabsList>

      <TabsContent value="moment" className="mt-8">
        <WorkshopDetails type="moment" />
      </TabsContent>

      <TabsContent value="deal" className="mt-8">
        <WorkshopDetails type="deal" />
      </TabsContent>

      <TabsContent value="day" className="mt-8">
        <WorkshopDetails type="day" />
      </TabsContent>
    </Tabs>
  );
}
