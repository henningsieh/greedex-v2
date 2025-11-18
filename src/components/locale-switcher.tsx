"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLocaleData, type LocaleCode } from "@/lib/i18n/locales";
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
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="border border-muted">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 rounded-full border-bg-muted-foreground dark:hover:bg-accent/20",
            isPending ? "opacity-70" : "",
            className,
          )}
          disabled={isPending}
        >
          {currentLocale?.Flag && (
            <currentLocale.Flag className="size-6 rounded-sm border-none" />
          )}
          {/* <span className="font-semibold text-sm">
            {currentLocale?.nativeName ?? currentLocale?.label}
          </span> */}
          <ChevronDown
            className={cn("size-4", isPending && "animate-pulse")}
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-60">
        {locales.map((entry) => (
          <DropdownMenuItem
            key={entry.code}
            onSelect={(event) => {
              event.preventDefault();
              handleLocaleChange(entry.code);
            }}
            disabled={entry.code === locale}
            className="group flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              {entry.Flag && (
                <entry.Flag className="h-4 w-6 rounded-sm border border-border/20" />
              )}
              <span className="flex flex-col gap-0.5 leading-tight">
                <span className="font-semibold text-sm">
                  {entry.nativeName}
                </span>
                <span className="text-muted-foreground text-xs group-hover:text-accent-foreground">
                  {entry.englishName}
                </span>
              </span>
            </span>
            {locale === entry.code && (
              <Check className="size-4 text-primary" aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
