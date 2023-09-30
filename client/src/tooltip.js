import * as d3 from "d3";

export const DetailTooltip = ({ active, payload, _label }) => {
    const dateFormatter = (date) => {
      return d3.utcFormat("%-m/%-d")(date);
    };
  
    if (active && payload && payload.length) {
      const date = dateFormatter(payload[0].payload.date);
      const time_to_solve = payload[0].payload.secs_to_solve;
      const board = payload[0].payload.puzzle_board;
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
            <div>solve time: {time_to_solve}s</div>
            <div className="solved-crossword">
              {grid.map((cell) => {
                return (
                  <div className="crossword-row">
                    {cell.map((letter) => {
                      return <div className="crossword-cell">{letter}</div>;
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