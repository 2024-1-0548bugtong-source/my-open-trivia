import { Timestamp } from "firebase/firestore";

/**
 * Safely converts various date representations to a JavaScript Date object.
 * Handles Firestore Timestamp, millisecond timestamps, Date objects, ISO strings, and invalid input.
 *
 * @param value - Firestore Timestamp, {seconds, nanoseconds}, Date, timestamp number, ISO string, or any value
 * @returns JavaScript Date object or null if conversion fails
 */
export function toJsDate(value: any): Date | null {
  if (!value) {
    return null;
  }

  // Already a Date object
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  // Firestore Timestamp object: has toDate() method
  if (value && typeof value.toDate === "function") {
    try {
      const date = value.toDate();
      return isValidDate(date) ? date : null;
    } catch {
      return null;
    }
  }

  // Firestore Timestamp as plain object: {seconds: number, nanoseconds: number}
  if (value && typeof value === "object" && "seconds" in value) {
    try {
      const date = new Date(value.seconds * 1000);
      return isValidDate(date) ? date : null;
    } catch {
      return null;
    }
  }

  // ISO string or timestamp number
  if (typeof value === "string" || typeof value === "number") {
    try {
      const date = new Date(value);
      return isValidDate(date) ? date : null;
    } catch {
      return null;
    }
  }

  // Unknown format
  return null;
}

/**
 * Checks if a Date object is valid (not Invalid Date).
 */
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

/**
 * Formats a date for display in the UI.
 * Returns a localized date string or "—" if invalid/missing.
 *
 * @param value - Firestore Timestamp, Date, string, number, or any value
 * @returns Formatted date string (e.g., "2/2/2026") or "—" if invalid
 */
export function formatDate(value: any): string {
  const date = toJsDate(value);
  if (!date) {
    return "—";
  }
  return date.toLocaleDateString();
}

/**
 * Formats a date with time (e.g., "2/2/2026, 3:45 PM").
 *
 * @param value - Firestore Timestamp, Date, string, number, or any value
 * @returns Formatted date+time string or "—" if invalid
 */
export function formatDateTime(value: any): string {
  const date = toJsDate(value);
  if (!date) {
    return "—";
  }
  return date.toLocaleString();
}
