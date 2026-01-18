// back-to-home.tsx

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeftIcon } from "lucide-react";

interface Props {
  label?: string;
  href?: string;
}

export function BackToHome({ label = "Back to Home", href }: Props) {
  const defaultHref = "/";
  return (
    <div className="flex justify-start gap-2">
      <Button asChild variant="outline">
        <Link href={href ?? defaultHref}>
          <ChevronLeftIcon />
          {label}
        </Link>
      </Button>
    </div>
  );
}
