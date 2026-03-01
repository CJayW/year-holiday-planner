"use client";
import React, { useMemo } from "react";
import YearCalendar from "@/components/Calendar";
import { useBankHolidays } from "@/hooks/useBankHolidays";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface HolidayPickerProps {
  startDate?: Date;
  endDate?: Date;
}

// Minimum number of consecutive days to show as a holiday period
const MIN_HOLIDAY_PERIOD_DAYS = 4;

export default function HolidayPicker({
  startDate = new Date(new Date().getFullYear(), 0),
  endDate = new Date(new Date().getFullYear(), 11, 31),
}: HolidayPickerProps) {
  const year = startDate.getFullYear();
  const storageKey = `holidayPicker_${year}`;

  const { count: bankHolidayCount, entries: bankHolidayEntries } =
    useBankHolidays(startDate, endDate);

  // Single unified state for all booked days
  const [currentState, setState] = useLocalStorage<{
    userHolidayDates: string[];
    pto: number;
  }>(storageKey, { userHolidayDates: [], pto: 0 });

  const ptoDays = currentState.pto;
  const userHolidays = currentState.userHolidayDates.map((dateStr) => ({
    date: new Date(dateStr),
    tag: "holiday" as const,
  }));

  const unbookedDays = ptoDays - userHolidays.length;

  // Calculate holiday periods (4+ consecutive days off including weekends)
  const holidayPeriods = useMemo(() => {
    // combine all off days: bank holidays + user holidays
    const allOffDays = new Set<string>();
    bankHolidayEntries.forEach((h) => {
      allOffDays.add(new Date(h.date).toDateString());
    });
    userHolidays.forEach((h) => {
      allOffDays.add(h.date.toDateString());
    });

    // also add weekends in the range
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0); // normalize to midnight
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0); // normalize to midnight

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        allOffDays.add(current.toDateString());
      }
      current.setDate(current.getDate() + 1);
    }

    // find consecutive stretches
    const sortedDays = Array.from(allOffDays)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    const periods: Array<{
      start: Date;
      end: Date;
      days: number;
      gapDays?: number;
    }> = [];
    if (sortedDays.length === 0) return periods;

    let currentStart = sortedDays[0];
    let currentEnd = sortedDays[0];

    for (let i = 1; i < sortedDays.length; i++) {
      const prev = sortedDays[i - 1];
      const curr = sortedDays[i];
      const diffDays =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentEnd = curr;
      } else {
        const days =
          Math.round(
            (currentEnd.getTime() - currentStart.getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1;
        if (days >= MIN_HOLIDAY_PERIOD_DAYS) {
          periods.push({ start: currentStart, end: currentEnd, days });
        }
        currentStart = curr;
        currentEnd = curr;
      }
    }

    // Check last period
    const days =
      Math.round(
        (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    if (days >= MIN_HOLIDAY_PERIOD_DAYS) {
      periods.push({ start: currentStart, end: currentEnd, days });
    }

    // Add gap information between periods
    for (let i = 0; i < periods.length - 1; i++) {
      const gap = Math.round(
        (periods[i + 1].start.getTime() - periods[i].end.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      periods[i].gapDays = gap;
    }

    return periods;
  }, [bankHolidayEntries, userHolidays, startDate, endDate]);
  const handleDateSelect = (date: Date) => {
    const existingIndex = userHolidays.findIndex(
      (e) => e.date.toDateString() === date.toDateString(),
    );
    const updated =
      existingIndex >= 0
        ? userHolidays.filter((_, i) => i !== existingIndex)
        : [...userHolidays, { date, tag: "holiday" as const }];

    setState((prev) => ({
      ...prev,
      userHolidayDates: updated.map((h) => h.date.toISOString()),
    }));
  };

  const handleDateHover = (date: Date | null) => {
    // no-op or you could show tooltip
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* sidebar with totals and list */}
      <aside className="w-full lg:w-1/4 bg-gray-50 p-4 rounded-lg shadow">
        <div className="space-y-4">
          <div className="font-semibold">Totals</div>
          <div className="text-xl font-bold">
            Bank holidays: {bankHolidayCount}
          </div>
          <div className="text-xl font-bold">
            Selected holidays: {userHolidays.length}
          </div>
          <div className="text-xl font-bold">PTO days: {ptoDays}</div>
          <div className="text-lg">
            Days off: {bankHolidayCount + userHolidays.length}
          </div>
          <div className="text-xl font-extrabold text-red-600">
            Unbooked days: {unbookedDays}
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-medium" htmlFor="pto-input">
            PTO days:
          </label>
          <input
            id="pto-input"
            type="number"
            min={0}
            value={ptoDays}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setState((prev) => ({
                ...prev,
                pto: value,
              }));
            }}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {holidayPeriods.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Holiday periods</h2>
            <ul className="space-y-2">
              {holidayPeriods.map((period, idx) => (
                <React.Fragment key={idx}>
                  <li className="text-sm bg-white p-2 rounded">
                    <div className="font-semibold">
                      {period.start.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" - "}
                      {period.end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {period.days} days
                    </div>
                  </li>
                  {period.gapDays !== undefined && (
                    <div className="text-xs text-gray-400 mt-1">
                      Gap: {Math.round(period.gapDays)} days
                    </div>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* calendar area */}
      <div className="flex-1">
        <YearCalendar
          startDate={startDate}
          endDate={endDate}
          styledDates={[...userHolidays, ...bankHolidayEntries]}
          onDateSelect={handleDateSelect}
          onDateHover={handleDateHover}
        />
      </div>
    </div>
  );
}
