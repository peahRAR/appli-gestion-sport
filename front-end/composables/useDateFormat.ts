type DateInput = Date | string | number | null | undefined;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Parses a date, reading a "YYYY-MM-DD" prefix as local calendar date (day/month/year)
// rather than letting the JS Date parser treat it as UTC midnight, which can shift the
// displayed day by one depending on the browser's timezone offset.
function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// JJ/MM/AAAA
export function formatDate(value: DateInput, fallback = ""): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Age in full years, accounting for whether this year's birthday has passed yet.
export function calculateAge(value: DateInput): number | null {
  const date = toValidDate(value);
  if (!date) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

// JJ/MM/AAAA (XX ans)
export function formatBirthday(value: DateInput, fallback = "Non renseigné"): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  const age = calculateAge(date);
  return `${formatDate(date)} (${age} ans)`;
}

export function useDateFormat() {
  return { formatDate, formatBirthday, calculateAge };
}
