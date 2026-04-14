"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

interface DatePickerClientProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  label?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

const PICKER_OPEN_EVENT = "datepicker:open";

export function DatePickerClient({
  date,
  onSelect,
  label = "Sélectionner une date",
}: DatePickerClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const instanceId = useRef(`dp-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail !== instanceId.current) {
        setIsOpen(false);
      }
    };
    document.addEventListener(PICKER_OPEN_EVENT, handler);
    return () => document.removeEventListener(PICKER_OPEN_EVENT, handler);
  }, []);

  const open = () => {
    document.dispatchEvent(
      new CustomEvent(PICKER_OPEN_EVENT, { detail: instanceId.current })
    );
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  if (!mounted) {
    return <div className="h-10 w-full border rounded-md bg-gray-100" />;
  }

  // ── Mobile : input natif iOS/Android ────────────────────────────────────
  if (isMobile) {
    const inputValue = date ? format(date, "yyyy-MM-dd") : "";
    return (
      <div className="flex items-center gap-2 h-10 px-3 border border-input rounded-md bg-background">
        <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="date"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val ? new Date(val + "T00:00:00") : undefined);
          }}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-sm focus:outline-none [color-scheme:light]",
            !date && "text-muted-foreground"
          )}
        />
      </div>
    );
  }

  // ── Desktop : position fixed dans l'arbre Radix (pas de portal) ──────────
  // position:fixed échappe à l'overflow du modal SANS sortir du subtree Radix,
  // ce qui permet aux pointer events de fonctionner normalement.
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        onClick={open}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {date ? format(date, "PPP", { locale: fr }) : <span>{label}</span>}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          onClick={close}
        >
          <div
            className="bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                onSelect(newDate);
                close();
              }}
              locale={fr}
              className="p-3 rounded-xl"
              classNames={{
                day_selected: "bg-amber-600 text-white hover:bg-amber-700",
                day_today: "bg-gray-100 text-gray-900 font-bold",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
