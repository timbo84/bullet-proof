// "Today" for daily declarations, in America/Chicago — matches the original
// backend's today_central() so the once-per-day boundary lines up the same
// way regardless of the server's own timezone.
export function todayCentral() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// "14:30" -> "2:30 PM". Spec requires 12-hour AM/PM formatting everywhere.
export function formatTime12(hhmm) {
  if (!hhmm) return "";
  const [hStr, mStr = "00"] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr.padStart(2, "0")} ${period}`;
}
