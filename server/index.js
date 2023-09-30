import path from "path";
import express from "express";
import * as d3 from "d3";
import { fileURLToPath } from "url";
import * as LS from "node-localstorage";
import * as helpers from "./helpers.cjs";

const PORT = process.env.PORT || 3002;
const app = express();
var localStorage = new LS.LocalStorage("./scratch");
const DEFAULT_TIME_RANGE = [new Date("2023-08-29"), new Date("2023-09-28")];

app.use(function (_req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const nyt = async (path, token, storage) => {
  const key = helpers.createHashForToken(String([path, token]));
  if (storage && storage.getItem(key)) return JSON.parse(storage.getItem(key));
  const json = await fetch(`https://nytimes.com/${path}`, {
    headers: { "nyt-s": token },
  }).then((res) => {
    return res.json();
  });
  if (storage) storage.setItem(key, JSON.stringify(json));
  return json;
};

const puzzles = async (token, type, time_range) =>
  (
    await Promise.all(
      (await helpers.batchedTimeRanges(time_range)).map(([start, end]) =>
        nyt(
          `svc/crosswords/v3/undefined/puzzles.json?publish_type=${type}&date_start=${start}&date_end=${end}`,
          token
        ).then((json) => {
          return json.results;
        })
      )
    )
  )
    .flat()
    .map((puzzle) => {
      return { ...puzzle, date: d3.utcParse("%Y-%m-%d")(puzzle.print_date) };
    });

const solutions = async (token, type, time_range) =>
  Promise.all(
    (await puzzles(token, type, time_range)).map((puzzle) => {
      return nyt(
        `svc/crosswords/v6/game/${puzzle.puzzle_id}.json`,
        token,
        localStorage
      ).then((json) => {
        if (json.calcs && json.calcs.percentFilled == 100) {
          const date = d3.utcParse("%Y-%m-%d")(puzzle.print_date);
          return {
            user_id: json.userID,
            date: date.getTime(),
            secs_to_solve: json.calcs.secondsSpentSolving,
            puzzle_board: json.board,
            puzzle_url:
              "https://www.nytimes.com/crosswords/game/" +
              (type == "normal" ? "daily" : "mini") +
              "/" +
              d3.utcFormat("%Y/%m/%d")(date),
          };
        }
        return null;
      });
    })
  );

app.get(
  "/crossword_stats/user_tokens/:userTokens/start_date/:startDate/end_date/:endDate/type/:type",
  async (req, res) => {
    const user_tokens = req.params["userTokens"]
      .split(",")
      .map((token) => decodeURIComponent(token));
    const type = req.params["type"];
    var time_range = DEFAULT_TIME_RANGE;
    const time_params = [req.params["startDate"], req.params["endDate"]].map(
      d3.utcParse("%Q")
    );
    if (time_params[0] && time_params[1] && time_params[1] > time_params[0]) {
      time_range = time_params;
    }
    return res.json(await Promise.all(
      user_tokens
        .map(
          async (token) =>
            await solutions(token, type, time_range).then((result) => {
              return result.filter((val) => val);
            })
        )
        .sort((a, b) => (a.date < b.date ? -1 : 1))
    ));
  }
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
