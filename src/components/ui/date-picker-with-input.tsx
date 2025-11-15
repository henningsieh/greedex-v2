"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";

interface DatePickerWithInputProps {
  id: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function DatePickerWithInput({
  id,
  value,
  onChange,
  placeholder = "DD.MM.YYYY",
}: DatePickerWithInputProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(value);

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        type="text"
        value={formatDate(value)}
        placeholder={placeholder}
        readOnly
        className="cursor-pointer bg-background pr-10"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="-translate-y-1/2 absolute top-1/2 right-1 size-7.5"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DatePickerWithInput, type DatePickerWithInputProps };