export function getBankHolidays(year: number): {
  day: number;
  month: number;
  name: string;
}[] {
  return [
    { day: 1, month: 0, name: "New Year's Day" },
    { day: 3, month: 3, name: "Good Friday" },
    { day: 6, month: 3, name: "Easter Monday" },
    { day: 4, month: 4, name: "Early May Bank Holiday" },
    { day: 25, month: 4, name: "Spring Bank Holiday" },
    { day: 31, month: 7, name: "Summer Bank Holiday" },
    { day: 25, month: 11, name: "Christmas Day" },
    { day: 28, month: 11, name: "Boxing Day (substitute day)" },
  ];
}
