export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const formatTimeForInput = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};
