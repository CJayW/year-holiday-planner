"use client";

import YearCalendar from "@/components/Calendar";
import Image from "next/image";

export default function Home() {
  const exampleStyledDates = [
    // Holidays
    { date: new Date(2026, 0, 1), tag: "holiday" }, // New Year's Day
    { date: new Date(2026, 11, 25), tag: "holiday" }, // Christmas
    { date: new Date(2026, 6, 4), tag: "holiday" }, // July 4th

    // Current date
    { date: new Date(2026, 2, 1), tag: "current" }, // Today

    // Custom tags
    { date: new Date(2026, 4, 15), tag: "birthday" },
    { date: new Date(2026, 5, 20), tag: "vacation" },
  ];

  // Define custom classnames for each tag
  const tagStyles = {
    holiday: "bg-red-100 text-red-900",
    current: "bg-green-100 text-green-900",
    birthday: "bg-pink-200 text-pink-900 font-bold",
    vacation: "bg-yellow-100 text-yellow-900",
    selected: "bg-purple-200 text-purple-900",
  };

  const handleDateSelect = (date: Date) => {
    console.log("Selected date:", date.toDateString());
  };

  const handleDateHover = (date: Date | null) => {
    if (date) {
      console.log("Hovering over:", date.toDateString());
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Full year calendar */}
        <YearCalendar
          startDate={new Date(2026, 3)}
          endDate={new Date(2027, 2)}
          styledDates={exampleStyledDates}
          tagStyles={tagStyles}
          onDateSelect={handleDateSelect}
          onDateHover={handleDateHover}
        />

        {/* Optional: Example with custom date range spanning years */}
        {/* <YearCalendar
          startDate={new Date(2025, 10)} // November 2025
          endDate={new Date(2026, 2)}    // March 2026
          styledDates={exampleStyledDates}
          tagStyles={tagStyles}
          onDateSelect={handleDateSelect}
          onDateHover={handleDateHover}
        /> */}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
