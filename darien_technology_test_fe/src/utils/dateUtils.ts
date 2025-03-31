import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const formatDate = (dateString: string): string => {
  // If the string doesn't contain time information, use it directly
  if (dateString.length === 10 && dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return format(date, "MMM d, yyyy");
  }

  // Otherwise, handle as ISO date string
  const date = parseISO(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, "MMM d, yyyy");
};

export const formatTime = (timeString: string): string => {
  try {
    // Parse the ISO string to a Date object
    const date = parseISO(timeString);

    // Create a new date object that preserves the hours/minutes but uses local timezone
    // This effectively ignores the timezone part of the ISO string
    const localDate = new Date();
    localDate.setHours(date.getUTCHours());
    localDate.setMinutes(date.getUTCMinutes());
    localDate.setSeconds(0);

    // Format the time in 12-hour format with AM/PM
    return format(localDate, "h:mm a");
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString; // Return original string if parsing fails
  }
};

export const formatDateForInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export const formatTimeForInput = (date: Date): string => {
  // Create a new date that preserves only the hours and minutes in local time
  const localDate = new Date();
  localDate.setHours(date.getHours());
  localDate.setMinutes(date.getMinutes());
  localDate.setSeconds(0);

  return format(localDate, "HH:mm");
};

export const formatISOTimeForInput = (isoString: string): string => {
  try {
    // Extract time directly from the ISO string without time zone conversion
    // Format: "2023-06-15T14:00:00.000Z" -> extract "14:00"
    const timeMatch = isoString.match(/T(\d{2}):(\d{2})/);

    if (timeMatch && timeMatch.length >= 3) {
      const hours = timeMatch[1];
      const minutes = timeMatch[2];
      return `${hours}:${minutes}`;
    }

    // Fallback to the previous implementation if regex doesn't match
    const date = parseISO(isoString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting ISO time for input:", error);
    return "00:00"; // Default fallback
  }
};
