var mongoose = require("mongoose");

var SummonerSchema = new mongoose.Schema({
  summonerName: String,
  summonerId: Number
});


module.exports = mongoose.model("Summoner", SummonerSchema);
