export function formatTime(secs) {
  if (secs > 60) {
    return Math.floor(secs / 60) + "m" + formatTime(secs % 60);
  }
  return secs + "s";
}

export const colors = ["#a8d1d1", "#9ea1d4", "#618264", "#FD8A8A", "#D2E0FB"];

export function assignRandomColor(existing_users) {
  let chosen_color =
    colors[Math.floor(Math.random() * colors.length)];
  while (
    existing_users.filter((user) => user.color == chosen_color).length > 0
  ) {
    chosen_color =
      colors[Math.floor(Math.random() * colors.length)];
  }
  return chosen_color;
}
