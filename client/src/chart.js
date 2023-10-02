import React, { PureComponent } from "react";
import { DetailTooltip } from "./tooltip.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as d3 from "d3";

export default class SolveTimesChart extends PureComponent {
  render() {
    const data = this.props.data.filter((val) => val);
    if (!data || data.length == 0) {
      return <div />;
    }
    const users = this.props.users;
    const dateFormatter = (date) => {
      return d3.utcFormat("%-m/%-d")(date);
    };

    const start_date = Math.min(...data.map((puzzles) => puzzles[0].date));
    const end_date = Math.max(
      ...data.map((puzzles) => puzzles[puzzles.length - 1].date)
    );

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <Tooltip content={<DetailTooltip />} />
          <XAxis
            dataKey="date"
            domain={[start_date, end_date]}
            type="number"
            tickFormatter={dateFormatter}
            ticks={d3.scaleTime().domain([start_date, end_date]).ticks(5)}
          />
          <YAxis />
          {data.map((user_data) => {
            let color =
              user_data.length > 0
                ? users.find((user) => {
                    return user.user_id == user_data[0].user_id;
                  }).color
                : 0;
            return (
              <Line
                key={"line_" + user_data[0].user_id}
                activeDot={false}
                type="monotone"
                data={user_data}
                dataKey="secs_to_solve"
                stroke={color}
                strokeWidth={2}
                label={<LabelAsPoint data={user_data} color={color} />}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

export class LabelAsPoint extends React.Component {
  onClick = () => {
    const clicked_point = this.props.data[this.props.index];
    window.open(clicked_point.puzzle_url, "_blank", "noreferrer");
  };
  render() {
    const { x, y } = this.props;
    return (
      <circle
        className={"dot"}
        onClick={this.onClick}
        cx={x}
        cy={y}
        r={4}
        fill={this.props.color}
      />
    );
  }
}
