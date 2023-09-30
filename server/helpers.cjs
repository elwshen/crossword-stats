var crypto = require("crypto");

const createHashForToken = function (data) {
  return crypto.createHash("shake256", 8).update(data).digest("hex");
};

const batchedTimeRanges = async function (time_range) {
  let d3 = await import("d3");
  const dateFormat = d3.utcFormat("%Y-%m-%d");
  const batches = [];
  const start = time_range[0];
  const end = time_range[1];
  const max_api_results = 100;
  if (d3.timeDays(start, end).length <= max_api_results) {
    batches.push([start, end]);
  } else {
    let current_batch_start = start;
    let current_batch_end = Math.min(
      d3.utcDay.offset(current_batch_start, max_api_results),
      end
    );
    batches.push([current_batch_start, current_batch_end]);
    while (current_batch_end < end) {
      current_batch_start = d3.utcDay.offset(current_batch_end, 1);
      current_batch_end = Math.min(
        d3.utcDay.offset(current_batch_start, max_api_results),
        end
      );
      batches.push([current_batch_start, current_batch_end]);
    }
  }
  return batches.map((arr) => arr.map(dateFormat));
};

exports.createHashForToken = createHashForToken;
exports.batchedTimeRanges = batchedTimeRanges;
