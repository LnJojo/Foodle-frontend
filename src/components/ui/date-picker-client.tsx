// components/ui/date-picker-client.tsx
"use client";

import { useEffect, useState, useRef } from "react";
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

export function DatePickerClient({
  date,
  onSelect,
  label = "Sélectionner une date",
}: DatePickerClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Fonction pour fermer le calendrier quand on clique à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full border rounded-md bg-gray-100"></div>;
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant={"outline"}
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP", { locale: fr }) : <span>{label}</span>}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-md">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onSelect(newDate);
              setIsOpen(false);
            }}
            locale={fr}
            className="bg-white p-3 rounded-md"
            classNames={{
              day_selected: "bg-amber-600 text-white hover:bg-amber-700",
              day_today: "bg-gray-100 text-gray-900 font-bold",
            }}
          />
        </div>
      )}
    </div>
  );
}
