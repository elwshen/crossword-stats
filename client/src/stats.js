import React, { PureComponent } from "react";
import * as helpers from "./helpers.js";

export default class StatsContainer extends PureComponent {
  render() {
    const aggStats = this.props.aggStats;
    return (
      <div className="agg-stats">
        {Object.keys(aggStats).map((stat) => {
          const value = Object.values(aggStats[stat]).sort(
            (a, b) => a.time - b.time
          );
          return (
            <div className="cell">
              {stat}
              {Object.values(value).map((user_data, index) => (
                <div
                  className="cell-value"
                  style={{
                    backgroundColor: helpers.colors[user_data.user_id],
                  }}
                >
                  {index + 1 + ". " + helpers.formatTime(user_data.time)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
}
