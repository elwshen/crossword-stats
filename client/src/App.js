import React from "react";
import "./App.css";
import SolveTimesChart from "./chart.js";
import * as d3 from "d3";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import StatsContainer from "./stats.js";
import * as helpers from "./helpers.js";

function App() {
  dayjs.extend(utc);
  const [data, setData] = React.useState(null);
  const [aggStats, setAggStats] = React.useState([]);
  const [dateRange, setDateRange] = React.useState(
    [d3.utcMonth.offset(new Date(), -1), new Date()].map(d3.utcFormat("%Q"))
  );
  const [crosswordType, setCrosswordType] = React.useState("mini");
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetchMiniCrosswordData();
  }, [dateRange, crosswordType, users]);

  function onAddToken(e) {
    e.preventDefault();
    const new_token = document.getElementById("token").value;
    const new_name = document.getElementById("display_name").value;
    const user_id = document.getElementById("user_id").value;
    document.getElementById("token").value = "";
    document.getElementById("display_name").value = "";
    document.getElementById("user_id").value = "";
    setUsers(
      users.concat({
        name: new_name,
        token: new_token,
        user_id: user_id,
        color: helpers.assignRandomColor(users),
      })
    );
  }

  function calculateAggStats(user_data) {
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

    setAggStats(stats);
  }

  function fetchMiniCrosswordData() {
    fetch(
      "/crossword_stats/user_tokens/" +
        users.map((user) => encodeURIComponent(user.token)) +
        "/start_date/" +
        dateRange[0] +
        "/end_date/" +
        dateRange[1] +
        "/type/" +
        crosswordType
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data == null || data.length == 0) {
          return null;
        }
        const puzzle_data = data.filter(
          (user_data) => user_data && user_data.length > 0
        );
        calculateAggStats(puzzle_data);
        setData(puzzle_data);
      });
  }

  return (
    <div className="App">
      <div>
        <h1>nyt crossword stats</h1>
      </div>
      <div>
        <div className="body-container">
          <div className="chart-container">
            {data == null ? null : (
              <div className="type-toggles">
                <button
                  className="type-toggle"
                  disabled={crosswordType == "mini"}
                  onClick={() =>
                    crosswordType == "normal" ? setCrosswordType("mini") : null
                  }
                >
                  mini
                </button>
                <button
                  className="type-toggle"
                  disabled={crosswordType == "normal"}
                  onClick={() =>
                    crosswordType == "mini" ? setCrosswordType("normal") : null
                  }
                >
                  normal
                </button>
              </div>
            )}
            {data == null ? null : (
              <SolveTimesChart data={data} users={users} />
            )}
            <div className="under-chart">
              {data == null ? null : (
                <div className="date-range-picker">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      timezone="UTC"
                      className="date-picker"
                      onChange={(value) =>
                        setDateRange([new Date(value).getTime(), dateRange[1]])
                      }
                      defaultValue={dayjs(d3.utcParse("%Q")(dateRange[0]))}
                    />
                    <div className="dash">-</div>
                    <DatePicker
                      timezone="UTC"
                      className="date-picker"
                      onChange={(value) =>
                        setDateRange([dateRange[0], new Date(value).getTime()])
                      }
                      defaultValue={dayjs(d3.utcParse("%Q")(dateRange[1]))}
                    />
                  </LocalizationProvider>
                </div>
              )}
            </div>
          </div>
          <div className="side">
            {data == null ? null : (
              <div className="side-panel">
                <div className="legend">
                  <h3>players</h3>
                  {users.map((user) => (
                    <div style={{ backgroundColor: user.color }}>
                      {user.name}
                    </div>
                  ))}
                </div>
                <StatsContainer aggStats={aggStats} users={users} />
              </div>
            )}
            <form className="add-token-form" onSubmit={onAddToken}>
              <input placeholder="display name" id={"display_name"}></input>
              <input placeholder="token" id={"token"}></input>
              <input placeholder="user id" id={"user_id"}></input>
              <button className="add-token-button" onClick={onAddToken}>
                Add token
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
