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
import CrosswordTypeToggle from "./crosswordTypeToggle";

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
        setAggStats(helpers.calculateAggStats(puzzle_data));
        setData(puzzle_data);
      });
  }

  return (
    <div className="App">
      <h1>nyt crossword stats</h1>
      <div className="body-container">
        {data == null ? null : (
          <div className="chart-container">
            <CrosswordTypeToggle
              crosswordType={crosswordType}
              setCrosswordType={setCrosswordType}
            />
            <SolveTimesChart data={data} users={users} />
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
          </div>
        )}
        <div className="side-container">
          {data == null ? null : (
            <div className="top-panel">
              <div className="legend">
                <h3>players</h3>
                {users.map((user) => (
                  <div
                    key={"username_" + user.user_id}
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
              <StatsContainer aggStats={aggStats} users={users} />
            </div>
          )}
          <form className="add-token-form">
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
  );
}

export default App;
