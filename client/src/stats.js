import React, { PureComponent } from "react";
import * as helpers from "./helpers.js";

export default class StatsContainer extends PureComponent {
  render() {
    const { aggStats, users } = this.props;
    return (
      <div className="agg-stats">
        <h3>stats</h3>
        <table>
          {Object.keys(aggStats).map((stat) => {
            const value = Object.values(aggStats[stat]).sort(
              (a, b) => a.time - b.time
            );
            return (
              <tr key={"stat_row_" + stat}>
                <td> {stat} </td>
                {Object.values(value).map((user_data, index) => (
                  <td
                    key={"stat_cell_" + stat + "_" + index}
                    style={{
                      backgroundColor: users.find((user) => {
                        return user.user_id == user_data.user_id;
                      }).color,
                    }}
                  >
                    {index + 1 + ". " + helpers.formatTime(user_data.time)}
                  </td>
                ))}
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}
