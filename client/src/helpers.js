export function formatTime(secs) {
  if (secs > 60) {
    return Math.floor(secs / 60) + "m" + formatTime(secs % 60);
  }
  return secs + "s";
}

export const colors = { 140938625: "#a8d1d1", 60484427: "#9ea1d4" };
