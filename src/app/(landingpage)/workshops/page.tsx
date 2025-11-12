import { createParser } from "nuqs/server";
import { WorkshopContent } from "@/components/landingpage/workshops/workshop-tab-select";

const typeParser = createParser({
  parse: (value: unknown) => {
    if (value === "moment" || value === "deal" || value === "day") {
      return value as "moment" | "deal" | "day";
    }
    return "moment";
  },
  serialize: (value: unknown) => {
    return String(value);
  },
});

export default async function WorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }> | { type?: string };
}) {
  const params = await searchParams;
  const type =
    (typeParser.parse((params?.type ?? "") as string) as
      | "moment"
      | "deal"
      | "day") ?? "moment";

  return (
    <main className="min-h-screen py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-semibold text-4xl lg:text-5xl">
            Workshop Guide
          </h1>
          <p className="text-muted-foreground">
            Choose a workshop based on your available time
          </p>
        </div>

        {/* Client-side interactive tabs and content. Pass server-parsed initial type. */}
        <WorkshopContent initialType={type} />
      </div>
    </main>
  );
}
