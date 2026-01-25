"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import type { LocaleCode } from "@/config/languages";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLocaleData } from "@/lib/i18n/locales";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const locales = getLocaleData();
  const currentLocale = locales.find((entry) => entry.code === locale);

  function handleLocaleChange(newLocale: LocaleCode) {
    if (newLocale === locale || isPending) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, {
        locale: newLocale,
      });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="border border-muted">
        <Button
          aria-label={`Select language, current: ${currentLocale?.englishName || locale}`}
          className={cn(
            "gap-2 rounded-full border-none bg-transparent p-1 ring-1 ring-border hover:ring-primary",
            isPending && "opacity-70",
            className,
          )}
          disabled={isPending}
          size="sm"
          variant="ghost"
        >
          {currentLocale?.Flag && (
            <currentLocale.Flag className="size-6 rounded-sm border-none" />
          )}
          <ChevronDown
            aria-hidden
            className={cn("size-4", isPending && "animate-pulse")}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60" side="bottom">
        {locales.map((entry) => (
          <DropdownMenuItem
            className="group flex items-center justify-between gap-3"
            disabled={entry.code === locale}
            key={entry.code}
            onSelect={(event) => {
              event.preventDefault();
              handleLocaleChange(entry.code);
            }}
          >
            <span className="flex items-center gap-2">
              {entry.Flag && (
                <entry.Flag className="h-4 w-6 rounded-sm border border-border/20" />
              )}
              <span className="flex flex-col gap-0.5 leading-tight">
                <span className="text-sm font-semibold">
                  {entry.englishName} | {entry.code}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-accent-foreground">
                  {entry.label}
                </span>
              </span>
            </span>
            {locale === entry.code && (
              <Check aria-hidden className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
