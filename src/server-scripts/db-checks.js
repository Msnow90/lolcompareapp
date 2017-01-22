"use strict"
var mongoose = require("mongoose")
var Q 		 = require("q")

var Summoner = require("../models/summoner")
var Stats	 = require("../models/stats")



var dbChecks = {

	// will check database before making api calls to resolve an id to the name
	checkSummoner: function(summonerName) {

		var deferred = Q.defer()

		Summoner.findOne({summonerName: summonerName}, "summonerId", function(err, summonerId) {

			if(err) deferred.reject(`Failed to check database of summoner with name of: ${summonerName}`)

			deferred.resolve(summonerId)
		})


		return deferred.promise;

	},


	checkStats: function(collectionSummary) {

		var deferred = Q.defer()

		// need to check if the collection has a tier and division already in storage
		Stats.findOne({tier: collectionSummary["tier"], division: collectionSummary["division"]}, function(err, stats) {
			console.log(stats)
			console.log("stats above")
			if(err) deferred.reject("Failed to check stats in database!")

			if (stats["statsSummary"].length > 5) {
				deferred.resolve(stats, true)
			}

			else {
				deferred.resolve(collectionSummary, false)
			}
			//stats["statsSummary"].length > 5 ? deferred.resolve(collectionSummary, null) : deferred.resolve(null, stats)
			
		})

		return deferred.promise;
	}
//

}

module.exports = dbChecks;