"use client";

import { useState } from "react";

export interface DateEntry {
  date: Date;
  tag: string;
}

interface YearCalendarProps {
  startDate?: Date; // e.g., new Date(2025, 10) for November 2025
  endDate?: Date; // e.g., new Date(2026, 2) for March 2026
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
  "bank-holiday": "bg-orange-100 text-orange-900",
  current: "bg-green-100 text-green-900",
  selected: "outline outline-2 outline-blue-500",
};

export default function YearCalendar({
  startDate = new Date(new Date().getFullYear(), 0),
  endDate = new Date(new Date().getFullYear(), 11, 31),
  styledDates: _styledDates = [],
  tagStyles = {},
  onDateSelect,
  onDateHover,
}: YearCalendarProps) {
  const combinedDates = [..._styledDates];

  // Convert to processed format
  const styledDates = combinedDates.map((entry: DateEntry) => {
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

  // Calculate months to render
  const getMonthsToRender = (): Array<{ year: number; month: number }> => {
    const start = startDate;
    const end = endDate;

    const months: Array<{ year: number; month: number }> = [];
    let current = new Date(start.getFullYear(), start.getMonth());

    while (current <= end) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth(),
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const monthsToRender = getMonthsToRender();

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

  const renderMonth = (monthYear: { year: number; month: number }) => {
    const { year: monthYearValue, month: monthIndex } = monthYear;
    const firstDay = new Date(monthYearValue, monthIndex, 1);
    const lastDay = new Date(monthYearValue, monthIndex + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(monthYearValue, monthIndex, day));
    }

    // Pad to complete the grid (ensure we have space for 5 rows of 7 days)
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return (
      <div
        key={`${monthYearValue}-${monthIndex}`}
        className="border rounded-lg p-4 bg-white shadow-sm"
      >
        <h3 className="text-lg font-bold mb-4 text-center">
          {MONTHS[monthIndex]} {monthYearValue}
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
      <h1 className="text-3xl font-bold mb-8">
        {monthsToRender.length > 0 &&
        monthsToRender[0].year ===
          monthsToRender[monthsToRender.length - 1].year
          ? monthsToRender[0].year
          : `${monthsToRender[0]?.year} - ${monthsToRender[monthsToRender.length - 1]?.year}`}{" "}
        Calendar
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthsToRender.map((monthYear) => renderMonth(monthYear))}
      </div>
    </div>
  );
}
