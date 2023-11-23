"use client";

import * as React from "react";
import { format as formatDate } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/Button";
import { Calendar, CalendarProps } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { enUS } from "date-fns/locale";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { SetState } from "zustand";

export interface DateRangePickerProps {
  format?: string;
  value: DateRange | undefined;
  onSelect: SelectRangeEventHandler;
  onCloseAutoFocus?: (e: Event) => void;
  label?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DateRangePicker({
  format = "MM/dd/yyyy",
  value,
  onSelect,
  onCloseAutoFocus,
  label,
  open,
  setOpen,
}: DateRangePickerProps) {
  const handleSelect: SelectRangeEventHandler = (
    range,
    selectedDay,
    activeModifiers,
    e
  ) => {
    onSelect(range, selectedDay, activeModifiers, e);
  };

  const handleCloseAutoFocus = (e: Event) => {
    onCloseAutoFocus && onCloseAutoFocus(e);
  };

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />

          {value ? (
            <span className="whitespace-nowrap">
              {`${
                value.from
                  ? formatDate(value.from, format, { locale: enUS })
                  : ""
              } - ${
                value.to ? formatDate(value.to, format, { locale: enUS }) : ""
              }`}
            </span>
          ) : (
            <span className="whitespace-nowrap">
              {label || "Select a date range"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        onPointerDownOutside={() => setOpen(false)}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          /* onSelect={(day, selectedDay, activeModifiers, e) => {
            handleChange(day, selectedDay, activeModifiers, e);
            setOpen(false);
          }} */
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
