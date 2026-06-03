"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, PopoverBody } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DeadlinePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DeadlinePicker({ value, onChange, className }: DeadlinePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Derive time from value directly (no effect needed)
  const derived = React.useMemo(() => {
    if (!value) return { hour: "12", minute: "00", ampm: "AM" };
    let h = value.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return {
      hour: h.toString().padStart(2, "0"),
      minute: value.getMinutes().toString().padStart(2, "0"),
      ampm: ap,
    };
  }, [value]);

  const [hour, setHour] = React.useState(derived.hour);
  const [minute, setMinute] = React.useState(derived.minute);
  const [ampm, setAmpm] = React.useState(derived.ampm);

  // Keep synced with external value changes while respecting local edits
  const prevValueRef = React.useRef(value);
  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setHour(derived.hour);
      setMinute(derived.minute);
      setAmpm(derived.ampm);
    }
  }, [value, derived]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }
    const d = new Date(date);
    let h = parseInt(hour);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    d.setHours(h, parseInt(minute), 0, 0);
    onChange(d);
  };

  const handleTimeChange = (h: string, m: string, ap: string) => {
    if (!value) return;
    const d = new Date(value);
    let hour24 = parseInt(h);
    if (ap === "PM" && hour24 < 12) hour24 += 12;
    if (ap === "AM" && hour24 === 12) hour24 = 0;
    d.setHours(hour24, parseInt(m), 0, 0);
    onChange(d);
  };

  const clear = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground/70",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? format(value, "MMM d, yyyy · h:mm aa") : <span>Pick a deadline</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <PopoverBody className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelectDate}
          />
          {value && (
            <div className="flex items-center gap-2 border-t pt-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={hour} onValueChange={(v) => { setHour(v); handleTimeChange(v, minute, ampm); }}>
                <SelectTrigger className="w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = i + 1;
                    return (
                      <SelectItem key={h} value={h.toString().padStart(2, "0")}>
                        {h.toString().padStart(2, "0")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <span className="text-sm font-medium text-muted-foreground">:</span>
              <Select value={minute} onValueChange={(v) => { setMinute(v); handleTimeChange(hour, v, ampm); }}>
                <SelectTrigger className="w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["00", "15", "30", "45"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ampm} onValueChange={(v) => { setAmpm(v); handleTimeChange(hour, minute, v); }}>
                <SelectTrigger className="w-[68px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {value && (
            <Button variant="ghost" size="sm" onClick={clear} className="w-full text-xs text-muted-foreground">
              Clear deadline
            </Button>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
