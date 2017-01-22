var expect = require("chai").expect;

// require database assets and models
var mongoose = require("mongoose");
var Summoner = require("./models/summoner");
var mongoURL = require("./config")["mongoURL"];

//********** Need to configure using request module to check actual routes

describe('Database connection test!', function() {
  // connection needs to be accessible to beforeEach and afterEach functions
  mongoose.connect(mongoURL)

  

  it('Can write a summoner to DB...', function(done) {


    var summonerTest = new Summoner({
      summonerName: "Mr.Test",
      summonerId: 12345
    });

    summonerTest.save(function(error, result) {
      expect(error).to.be.a("null")
      done()
  
    })


  })


  it("Can remove items from DB...", function(done) {

    Summoner.remove({summonerName:"Mr.Test", summonerId:12345}, function(error) {
      expect(error).to.be.a("null")
      done()

    })

  })

});