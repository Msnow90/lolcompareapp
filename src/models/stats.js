var mongoose = require("mongoose");

var StatsSchema = new mongoose.Schema({
  tier: String,
  division: String,
  statsSummary: {},
  summonerCount: Number
});

module.exports = mongoose.model("Stats", StatsSchema);
