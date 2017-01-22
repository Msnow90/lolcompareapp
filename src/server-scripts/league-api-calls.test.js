var apiCalls = require("./league-api-calls");
var Q = require("q");
var apiKey = require("../config")["apiKey"];


var expect = require("chai").expect;

describe("Testing api calls...", function() {

	//testing getSummonerId method from apiCalls

	it("Can retrieve summoner id...", function(done) {

		this.timeout(3000)

		apiCalls.getSummonerId("Nodejs Man", apiKey)
		.then(function(summonerId) {


			expect(summonerId).to.equal(40492885)

			done()
		})

	})

	// testing getLeagueIdCollection method

	it("Can retrieve ids and form collection object...", function(done) {

		this.timeout(15000)

		apiCalls.getLeagueIdCollection(19887289, apiKey, "RANKED_SOLO_5x5")
		.then(function(collectionSummary) {

			expect(collectionSummary["summonerIds"].length > 5)

			done()
		})

	})


	it("Can parse array of summoner ids", function(done) {

		var collectionSummary = {}

		collectionSummary["summonerIds"] = [740791,581716,20130821]

		apiCalls.getSummaryCollection(collectionSummary, apiKey)
		.then(function(collectionSummary) {

			expect(collectionSummary["statsSummary"]["0"])

			done()

		})
	})

})