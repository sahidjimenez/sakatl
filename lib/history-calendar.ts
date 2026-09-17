export function historyDayKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function historyMonth(month: string) {
  const first = new Date(`${month}-01T12:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  const shift = (amount: number) => {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + amount);
    return date.toISOString().slice(0, 7);
  };
  return {
    label: first.toLocaleDateString("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }),
    previous: shift(-1), next: shift(1),
    cells: Array.from({ length: Math.ceil((offset + last.getUTCDate()) / 7) * 7 }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= last.getUTCDate() ? `${month}-${String(day).padStart(2, "0")}` : null;
    }),
  };
}
