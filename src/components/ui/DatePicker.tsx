"use client";

import * as React from "react";
import { format as formatDate } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { enUS } from "date-fns/locale";
import { SelectSingleEventHandler } from "react-day-picker";

export interface DatePickerProps {
  format?: string;
  value: Date | null;
  handleChange: SelectSingleEventHandler;
}

export function DatePicker({
  format = "PPPP",
  value,
  handleChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value || undefined;
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {date ? (
            formatDate(date, format, { locale: enUS })
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        onPointerDownOutside={() => setOpen(false)}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day, selectedDay, activeModifiers, e) => {
            handleChange(day, selectedDay, activeModifiers, e);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
