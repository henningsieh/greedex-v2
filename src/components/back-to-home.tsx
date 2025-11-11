import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  href?: Route;
};

export default function BackToHome({
  label = "Back to Home",
  href = "/",
}: Props) {
  return (
    <div className="flex justify-start gap-2">
      <Button variant="link" asChild>
        <Link href={href} aria-label={label}>
          <ChevronLeft />
          {label}
        </Link>
      </Button>
    </div>
  );
}
