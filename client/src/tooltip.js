import * as d3 from "d3";
import * as helpers from "./helpers.js";

export const DetailTooltip = ({ active, payload, _label }) => {
  const dateFormatter = (date) => {
    return d3.utcFormat("%-m/%-d")(date);
  };

  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const date = dateFormatter(data.date);
    const time_to_solve = data.secs_to_solve;
    const board = data.puzzle_board;
    const width = Math.round(Math.sqrt(board.cells.length));
    let grid = [];
    if (Math.pow(width, 2) == board.cells.length) {
      let curr_row = -1;
      for (let index = 0; index < board.cells.length; index++) {
        if (index % width == 0) {
          grid.push([]);
          curr_row += 1;
        }
        grid[curr_row].push(board.cells[index].guess ?? " ");
      }
    }

    return (
      <div className="detail-tooltip">
        <div>
          <div>date: {date}</div>
          <div>solve time: {helpers.formatTime(time_to_solve)}</div>
          <div className="solved-crossword">
            {grid.map((cell, index) => {
              return (
                <div key={"crossword_row_" + index} className="crossword-row">
                  {cell.map((letter, index) => {
                    return (
                      <div
                        key={"crossword_cell_" + index}
                        className="crossword-cell"
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return null;
};
