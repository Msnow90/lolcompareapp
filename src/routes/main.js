"use strict";

var router = require("express").Router();
var Q      = require("q");
var apiKey = require("../config")["apiKey"];

var Summoner = require("../models/summoner");
var Stats    = require("../models/stats");

var apiCalls = require("../server-scripts/league-api-calls");
var dbChecks = require("../server-scripts/db-checks");



router.get("/", function(req, res) {
  res.render("index");
});

router.post("/team-lookup", function(req, res) {


  var summonerName = req.sanitize(req.body.summonerName);

  dbChecks.checkSummoner(summonerName)
  .then(function(summonerId) {
    console.log("chain...2")
    // summonerId will either return null or the id...
    // must pass a summonerId to next step in the chain of promises so if
    // summonerId has already been resolved, we just return it 
    
    if (summonerId === null) {
      return apiCalls.getSummonerId(summonerName, apiKey)
    }

    return summonerId

  })
  .then(function(summonerId) {
    console.log("chain...3")
    // as stated from above comments, this step receives summonerId regardless

    // need to perform api request for league info, this will ensure that the
    // summoner hasn't ranked up since last checking info, this extra request
    // is done to keep data up to date
    return apiCalls.getLeagueIdCollection(summonerId, apiKey, "RANKED_SOLO_5x5")
  })
  .then(function(collectionSummary) {
    console.log("chain...4")
    // this step takes entire collection anyway since it will save doing an 
    // extra api request and retrieving the info again if need be

    return dbChecks.checkStats(collectionSummary)
  })
  .then(function(collectionSummary, summaryComplete) {

    console.log("chain...5")
    console.log(collectionSummary)
    console.log("col sum above")
    // if dbStatsCollection is null, the collectionSummary object will require 
    // processing of data from it's summonerIds array
    if (!summaryComplete) {
      // return api-stat collection process using current collection summary object
      return apiCalls.getSummaryCollection(collectionSummary, apiKey)
      //res.render("teamselection", {stats: "Hello!"})
    }

    else {
      //console.log(collectionSummary)
      res.render("teamselection", {stats: dbStatsCollection});
    }

  })
  .then(function(stats){

    Stats.create(stats, function(err, savedData) {

      if (err) {
        console.log(err)
        // change to provide feedback to user
        res.redirect("back")
      }

      res.render("teamselection", {stats: stats})

    })
    

  })
  .catch(function(err) {
    console.log(err)
    // send error object to ejs templates
    res.render("index", {error: "Error processing request!"})
  })




});

module.exports = router;
