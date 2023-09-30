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

function App() {
  dayjs.extend(utc);
  const [data, setData] = React.useState(null);
  const [aggStats, setAggStats] = React.useState([]);
  const [dateRange, setDateRange] = React.useState(
    [d3.utcMonth.offset(new Date(), -1), new Date()].map(d3.utcFormat("%Q"))
  );
  const [crosswordType, setCrosswordType] = React.useState("mini");

  const tokens = [
    "2EaMrfl24/XIwA2wR6SceiQDIGA/KAduAW0k113qRonzFGSVHxGbIcI5SplQNDuhtijOoea6bgYnTBH3pVcqmapm6FE2EUTFvlFSbzNxWVZQBt4MULXVkpe2s9BfGScIGbXtQ9nkvk2P3hbxyL9XGUcFSCjp7uwW.Rm2V073oeo2rd4q1iYRFi/t7a3A.qoGiUg/Q79qzXGd2RlxsgknkXoDA2pWDepIos^^^^CBQSLwiP39WlBhCmh9alBhoSMS3Q-uO_vXYPijH_onYGioYSIMvW6xwqAh53ONP5_t8EGkCQQEAy7FiGlLh6y_4-3CP99bvgmH45OCtLcqsv4TBdCSUjH1ScME0IReZ4uOknzWxb4z_3qHT1LlwAgOGkgQMF",
    "1E5XFaiWdzZ8XyeDkTF8I1zPtgu3U1hhH3SlwMn1FGcKTAkxUJwKiazpdV9PwYR2YXjOoea6bgYnTSC7mZxqsznIB64jOtZqE7xOprCFtdCrTCInBN8gIOssQhE5bPmBbZzrX536HBiJg0^^^^CBQSLwiwz8qmBhDr0MqmBhoSMS0C4DXNjxCQOg0mT5fpvS79IIGbmkMqAgAGOPnz5vkFGkBpk6f0LGvOIYwH8ZMSxBY0ebjDhNbFq-QZ8MAqjkzKcbUI0r-hjzHoNRuwNFEJ8KwpWU_KIUrQijyxOqkZrDsF",
  ];

  React.useEffect(() => {
    fetchMiniCrosswordData();
  }, [dateRange, crosswordType]);

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
        tokens.map((token) => encodeURIComponent(token)) +
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
        const puzzle_data = data.filter((user_data) => user_data && user_data.length > 0);
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
        {data == null ? (
          <div></div>
        ) : (
          <div className="body-container">
            <div className="chart-container">
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
              <SolveTimesChart data={data} />
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

            <div className="side-panel">
              <StatsContainer aggStats={aggStats} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
