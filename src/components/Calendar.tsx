"use client";

import { useState } from "react";

interface DateEntry {
  date: Date;
  tag: string;
}

interface YearCalendarProps {
  year?: number;
  styledDates?: DateEntry[];
  tagStyles?: Record<string, string>; // tag -> classname mapping
  onDateSelect?: (date: Date) => void;
  onDateHover?: (date: Date | null) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default tag styles
const DEFAULT_TAG_STYLES: Record<string, string> = {
  holiday: "bg-red-100 text-red-900",
  current: "bg-green-100 text-green-900",
  selected: "bg-purple-200 text-purple-900",
};

export default function YearCalendar({
  year = new Date().getFullYear(),
  styledDates: _styledDates = [],
  tagStyles = {},
  onDateSelect,
  onDateHover,
}: YearCalendarProps) {
  const styledDates = _styledDates.map((entry: DateEntry) => {
    const date = new Date(entry.date);
    const dateString = date.toDateString();

    return {
      ...entry,
      date,
      dateString,
    };
  });
  const dateMap = new Map<string, DateEntry[]>();
  styledDates.forEach((entry) => {
    const existing = dateMap.get(entry.dateString) || [];
    dateMap.set(entry.dateString, [...existing, entry]);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Merge default and custom tag styles
  const mergedTagStyles = { ...DEFAULT_TAG_STYLES, ...tagStyles };

  const getDateStyle = (date: Date): string => {
    const dateString = date.toDateString();
    const entry = dateMap.get(dateString) || [];
    const tags = entry.map((e) => e.tag);

    // Check if date is selected
    if (selectedDate === dateString) {
      tags.push("selected");
    }

    // Check if date has a tag
    const customStyle = tags.map((tag) => mergedTagStyles[tag]).join(" ");
    if (customStyle) return customStyle;

    // Default weekend styling
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return "bg-blue-100 text-blue-900";

    return "bg-gray-50 hover:bg-gray-100";
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date.toDateString());
    onDateSelect?.(date);
  };

  const handleDateHover = (date: Date | null) => {
    onDateHover?.(date);
  };

  const renderMonth = (monthIndex: number) => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, monthIndex, day));
    }

    // Pad to complete the grid (ensure we have space for 5 rows of 7 days)
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return (
      <div
        key={monthIndex}
        className="border rounded-lg p-4 bg-white shadow-sm"
      >
        <h3 className="text-lg font-bold mb-4 text-center">
          {MONTHS[monthIndex]} {year}
        </h3>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center rounded cursor-pointer text-sm font-medium transition-colors
                ${date ? getDateStyle(date) : "bg-transparent"}
              `}
              onClick={() => date && handleDateClick(date)}
              onMouseEnter={() => date && handleDateHover(date)}
              onMouseLeave={() => date && handleDateHover(null)}
            >
              {date?.getDate()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-8">{year} Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, monthIndex) =>
          renderMonth(monthIndex),
        )}
      </div>
    </div>
  );
}
