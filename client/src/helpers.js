export function formatTime(secs) {
  if (secs > 60) {
    return Math.floor(secs / 60) + "m" + formatTime(secs % 60);
  }
  return secs + "s";
}

export const colors = ["#a8d1d1", "#9ea1d4", "#618264", "#FD8A8A", "#D2E0FB"];

export function assignRandomColor(existing_users) {
  let chosen_color = colors[Math.floor(Math.random() * colors.length)];
  while (
    existing_users.filter((user) => user.color == chosen_color).length > 0
  ) {
    chosen_color = colors[Math.floor(Math.random() * colors.length)];
  }
  return chosen_color;
}

export function calculateAggStats(user_data) {
  var stats = {
    average: {},
    fastest: {},
    slowest: {},
    median: {},
  };
  user_data.map((puzzle_data) => {
    if (puzzle_data == null || puzzle_data == {}) {
      return {};
    }
    const puzzles_sorted_by_solve_time = JSON.parse(
      JSON.stringify(puzzle_data)
    ).sort((a, b) => (a.secs_to_solve < b.secs_to_solve ? -1 : 1));
    const user_id = String(puzzles_sorted_by_solve_time[0].user_id);

    stats.average[user_id] = {
      user_id: user_id,
      time: Math.round(
        puzzle_data.reduce((acc, curr) => acc + curr.secs_to_solve, 0) /
          puzzle_data.length
      ),
    };
    stats.fastest[user_id] = {
      user_id: user_id,
      time: puzzles_sorted_by_solve_time[0].secs_to_solve,
    };
    stats.slowest[user_id] = {
      user_id: user_id,
      time: puzzles_sorted_by_solve_time[
        puzzles_sorted_by_solve_time.length - 1
      ].secs_to_solve,
    };
    stats.median[user_id] = {
      user_id: user_id,
      time: puzzles_sorted_by_solve_time[
        Math.floor(puzzles_sorted_by_solve_time.length / 2)
      ].secs_to_solve,
    };
  });
  return stats;
}
