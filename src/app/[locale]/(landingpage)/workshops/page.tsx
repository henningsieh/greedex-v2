import { createParser } from "nuqs/server";

import { WorkshopContent } from "@/components/features/landingpage/workshops/workshop-tab-select";

const typeParser = createParser({
  parse: (value: unknown) => {
    if (value === "moment" || value === "deal" || value === "day") {
      return value as "moment" | "deal" | "day";
    }

    return "moment";
  },
  serialize: (value: unknown) => String(value),
});

/**
 * Render the Workshops page and determine the initial workshop type from the provided search parameters.
 *
 * The function reads `searchParams.type`, parses it into one of `"moment" | "deal" | "day"`, and falls back to `"moment"` when absent or unrecognized. The parsed value is passed as the `initialType` prop to the client-side `WorkshopContent` component.
 *
 * @param searchParams - An object or Promise resolving to an object that may contain a `type` query parameter used to select the initial workshop tab.
 * @returns A JSX element representing the Workshops page layout with the parsed initial workshop type applied to `WorkshopContent`.
 */
export default async function WorkshopsPage({
  searchParams,
}: {
  searchParams:
    | Promise<{
        type?: string;
      }>
    | {
        type?: string;
      };
}) {
  const params = await searchParams;
  const type =
    (typeParser.parse((params?.type ?? "") as string) as
      | "moment"
      | "deal"
      | "day") ?? "moment";

  return (
    <main className="relative min-h-screen py-28">
      <div className="relative z-10 container mx-auto max-w-5xl px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-semibold lg:text-5xl">
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
