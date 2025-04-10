"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

interface DatePickerClientProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  label?: string;
}

export function DatePickerClient({
  date,
  onSelect,
  label = "Sélectionner une date",
}: DatePickerClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full border rounded-md bg-gray-100"></div>;
  }

  return (
    <div className="relative">
      <div className="flex flex-col">
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          onClick={() => {
            const picker = document.getElementById("calendar-popup");
            if (picker) {
              picker.style.display =
                picker.style.display === "none" ? "block" : "none";
            }
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{label}</span>}
        </Button>
      </div>

      <div
        id="calendar-popup"
        className="absolute z-50 mt-1 bg-white border rounded-md shadow-md"
        style={{ display: "none" }}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onSelect(newDate);
            const picker = document.getElementById("calendar-popup");
            if (picker) {
              picker.style.display = "none";
            }
          }}
          locale={fr}
        />
      </div>
    </div>
  );
}
