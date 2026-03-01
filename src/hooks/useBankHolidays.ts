import { useMemo } from "react";
import { getBankHolidays } from "@/static/bankHolidays";

interface DateEntry {
  date: Date;
  tag: string;
}

/**
 * Returns bank holiday entries within a given date range as well as a count.
 *
 * @param startDate inclusive start of range
 * @param endDate inclusive end of range
 * @param enabled whether to include bank holidays at all
 */
export function useBankHolidays(
  startDate: Date,
  endDate: Date,
  enabled: boolean = true,
): { count: number; entries: DateEntry[] } {
  const result = useMemo(() => {
    if (!enabled) {
      return { count: 0, entries: [] };
    }

    const yearsToFetch = new Set<number>();
    let current = new Date(startDate.getFullYear(), startDate.getMonth());
    while (current <= endDate) {
      yearsToFetch.add(current.getFullYear());
      current.setMonth(current.getMonth() + 1);
    }

    const entries: DateEntry[] = [];
    yearsToFetch.forEach((year) => {
      const holidays = getBankHolidays(year);
      holidays.forEach((holiday) => {
        const date = new Date(year, holiday.month, holiday.day);
        if (date >= startDate && date <= endDate) {
          entries.push({ date, tag: "bank-holiday" });
        }
      });
    });

    return { count: entries.length, entries };
  }, [startDate, endDate, enabled]);

  return result;
}
