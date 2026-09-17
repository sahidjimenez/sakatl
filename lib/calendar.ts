// Calendar dates are civil days, not instants to convert in the browser.
export function getDashboardWeek(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const today = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  const todayWeekday = today.getUTCDay() || 7;
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - todayWeekday + 1 + index);
    return { key: date.toISOString().slice(0, 10), day: date.getUTCDate() };
  });
  return { weekDates, todayWeekday };
}
