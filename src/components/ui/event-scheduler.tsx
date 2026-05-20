"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  PlusCircle,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DeadlinePicker } from "@/components/ui/deadline-picker";

export interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  type: "deadline" | "meeting" | "task";
}

interface EventSchedulerProps {
  events: ScheduledEvent[];
  onAdd: (event: Omit<ScheduledEvent, "id">) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function EventScheduler({ events, onAdd, onDelete, className }: EventSchedulerProps) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState<Date>();
  const [type, setType] = React.useState<ScheduledEvent["type"]>("deadline");

  const sorted = React.useMemo(
    () => [...events].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events],
  );

  const handleAdd = () => {
    if (!title.trim() || !date) return;
    onAdd({ title: title.trim(), date, type });
    setTitle("");
    setDate(undefined);
  };

  return (
    <div className={cn("grid md:grid-cols-2 gap-6", className)}>
      {/* Creation Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-[#ff5f5f]/10 grid place-items-center">
            <CalendarDays size={16} className="text-[#ff5f5f]" />
          </div>
          <div>
            <h3 className="font-display text-[18px] text-gray-900">Schedule Event</h3>
            <p className="text-[11px] text-gray-400">Deadline · Meeting · Task</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase mb-1.5 block">
              Title
            </label>
            <Input
              placeholder="e.g., Q1 Campaign review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase mb-1.5 block">
              Type
            </label>
            <div className="flex gap-2">
              {(["deadline", "meeting", "task"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "text-[11px] px-3 py-1.5 rounded-full border transition-colors",
                    type === t
                      ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10"
                      : "border-gray-200 text-gray-500 hover:text-gray-800",
                  )}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase mb-1.5 block">
              Date & Time
            </label>
            <DeadlinePicker value={date} onChange={setDate} />
          </div>

          {/* Add button */}
          <Button
            onClick={handleAdd}
            disabled={!title.trim() || !date}
            className="w-full mt-2 flex items-center gap-2"
          >
            <PlusCircle size={14} />
            Add Event
          </Button>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ff5f5f]/10 grid place-items-center">
              <Calendar size={16} className="text-[#ff5f5f]" />
            </div>
            <div>
              <h3 className="font-display text-[18px] text-gray-900">Upcoming</h3>
              <p className="text-[11px] text-gray-400">
                {sorted.length} event{sorted.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {sorted.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-gray-400 text-center py-8"
              >
                No events scheduled yet.
              </motion.p>
            )}
            {sorted.map((ev) => {
              const now = new Date();
              const isOverdue = ev.date < now;
              const isSoon =
                !isOverdue && ev.date.getTime() - now.getTime() < 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "group flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                    isOverdue
                      ? "border-red-200 bg-red-50/60"
                      : isSoon
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Icon */}
                    <div
                      className={cn(
                        "mt-0.5 shrink-0 w-7 h-7 rounded-full grid place-items-center text-[10px]",
                        ev.type === "deadline"
                          ? "bg-[#ff5f5f]/10 text-[#ff5f5f]"
                          : ev.type === "meeting"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-emerald-50 text-emerald-500",
                      )}
                    >
                      {ev.type === "deadline"
                        ? "!"
                        : ev.type === "meeting"
                          ? "M"
                          : "T"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-400">
                          {format(ev.date, "MMM d · h:mm aa")}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                        {isSoon && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                            <AlertTriangle size={10} /> Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(ev.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                    aria-label="Delete event"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {sorted.length > 0 && sorted[0] && (
          <div className="border-t border-gray-100 mt-4 pt-3">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>
                Next:{" "}
                <span className="text-gray-700 font-medium">{sorted[0].title}</span> —{" "}
                {format(sorted[0].date, "MMM d · h:mm aa")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
