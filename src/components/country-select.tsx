"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAllCountries, getEUCountries } from "@/lib/i18n/country-i18n";
import { cn } from "@/lib/utils";

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  euOnly?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Country select component with flag icons and localized country names
 *
 * @example
 * ```tsx
 * <CountrySelect
 *   value={country}
 *   onValueChange={setCountry}
 *   euOnly={true}
 *   placeholder="Select a country..."
 * />
 * ```
 */
export function CountrySelect({
  value,
  onValueChange,
  euOnly = false,
  placeholder = "Select country...",
  className,
  disabled = false,
}: CountrySelectProps) {
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  const countries = React.useMemo(
    () => (euOnly ? getEUCountries(locale) : getAllCountries(locale)),
    [euOnly, locale],
  );

  const selectedCountry = countries.find((country) => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              {selectedCountry.Flag && (
                <selectedCountry.Flag className="h-4 w-6 rounded-sm border border-border/20" />
              )}
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  keywords={[country.name, country.code]}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {country.Flag && (
                    <country.Flag className="mr-2 h-4 w-6 rounded-sm border border-border/20" />
                  )}
                  <span>{country.name}</span>
                  <span className="ml-auto text-muted-foreground text-xs">
                    {country.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
