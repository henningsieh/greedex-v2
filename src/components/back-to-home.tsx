// back-to-home.tsx

import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

type Props = {
  label?: string;
  href?: string;
};

export function BackToHome({ label = "Back to Home", href }: Props) {
  const defaultHref = "/";
  return (
    <div className="flex justify-start gap-2">
      <Button variant="outline" asChild>
        <Link href={href ?? defaultHref}>
          <ChevronLeftIcon />
          {label}
        </Link>
      </Button>
    </div>
  );
}
