var Q = require("q");
var request = require("request");


var apiCalls = {

  // retrieve the summoner id attached (searching by name)
  getSummonerId: function(summonerName, apiKey) {

    var deferred = Q.defer();

    request("https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/" + summonerName +  "?" + apiKey, function(error, response, body){

      if (error || response.statusCode != 200){
        console.log(response.statusCode)
        deferred.reject(`Failed to retrieve summoner id of: ${summonerName}`);
      }

      if (!error && response.statusCode == 200){
        var formatSumName = summonerName.replace(/ /g, "").toLowerCase();
        var data = JSON.parse(body);
        var summonerId = data[formatSumName]["id"];
        deferred.resolve(summonerId);
      }
    });
    return deferred.promise;
  },

  // queueType submitted from user to determine which data to pull
  getLeagueIdCollection: function(summonerId, apiKey, queueType) {
    var deferred = Q.defer();

    // request league api, extract summoner ids from proper queue

    request("https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/" + summonerId + "?" + apiKey, function(error, response, body) {

      if (error || response.statusCode != 200) {
        console.log("Failure!!!")
        console.log(error);
        deferred.reject("Failed to retrieve summoner ids from league!");
      }
      
      if (!error && response.statusCode == 200){
       var data = JSON.parse(body);

       var refPt = data[summonerId];

       for (var i = 0; i < data[summonerId].length; ++i) {

        var collectionSummary = {
          tier: "",
          division: "",
          summonerIds: []
        };

        // only obtain data for desired queue type
        // need to add tier and division in above object
        // will maintain data integrity
        // need to loop through entries in desired queue
        if (refPt[i]["queue"] === queueType) {

          collectionSummary["tier"] = refPt[i]["tier"];
          collectionSummary["division"] = refPt[i]["entries"][0]["division"];

          for (var j = 0; j < refPt[i]["entries"].length; ++j) {

            collectionSummary["summonerIds"].push(refPt[i]["entries"][j]["playerOrTeamId"]);

          }
          
        }
      }
      deferred.resolve(collectionSummary);
    }
  }); 

    return deferred.promise;
  },

  getSummaryCollection: function(collectionSummary, apiKey) {

    var deferred = Q.defer()

    // declare necessary objects that data will accumulate in during multiple request calls

    /* ex:

    var statsSummary = {
      *championId*: {
        "kills": #,
        "deaths": #,
        "assists": #,
        "gamesPlayed": #, // will be the divisor to determine averages per game
        "wardsPlaced": #,
        "visionWardsPlaced": #,
        "wardsKilled": #,
        "damageDealtToChampions": #,,
      },
      *championId*....
    }

    */

var champAssociations = {"0": "Overall","1":"Annie","2":"Olaf","3":"Galio","4":"TwistedFate","5":"XinZhao","6":"Urgot","7":"Leblanc","8":"Vladimir","9":"FiddleSticks","10":"Kayle","11":"MasterYi","12":"Alistar",
"13":"Ryze","14":"Sion","15":"Sivir","16":"Soraka","17":"Teemo","18":"Tristana","19":"Warwick","20":"Nunu","21":"MissFortune","22":"Ashe","23":"Tryndamere","24":"Jax",
"25":"Morgana","26":"Zilean","27":"Singed","28":"Evelynn","29":"Twitch","30":"Karthus","31":"Chogath","32":"Amumu","33":"Rammus","34":"Anivia","35":"Shaco","36":"DrMundo",
"37":"Sona","38":"Kassadin","39":"Irelia","40":"Janna","41":"Gangplank","42":"Corki","43":"Karma","44":"Taric","45":"Veigar","48":"Trundle","50":"Swain","51":"Caitlyn",
"53":"Blitzcrank","54":"Malphite","55":"Katarina","56":"Nocturne","57":"Maokai","58":"Renekton","59":"JarvanIV","60":"Elise","61":"Orianna","62":"MonkeyKing","63":"Brand","64":"LeeSin",
"67":"Vayne","68":"Rumble","427": "Ivern", "69":"Cassiopeia","72":"Skarner","74":"Heimerdinger","75":"Nasus","76":"Nidalee","77":"Udyr","78":"Poppy","79":"Gragas","80":"Pantheon","81":"Ezreal",
"82":"Mordekaiser","83":"Yorick","84":"Akali","85":"Kennen","86":"Garen","89":"Leona","90":"Malzahar","91":"Talon","92":"Riven","96":"KogMaw","98":"Shen","99":"Lux",
"101":"Xerath","102":"Shyvana","103":"Ahri","104":"Graves","105":"Fizz","106":"Volibear","107":"Rengar","110":"Varus","111":"Nautilus","112":"Viktor","113":"Sejuani","114":"Fiora",
"115":"Ziggs","117":"Lulu","119":"Draven","120":"Hecarim","121":"Khazix","122":"Darius","126":"Jayce","127":"Lissandra","131":"Diana","133":"Quinn","134":"Syndra","136":"AurelionSol",
"143":"Zyra","150":"Gnar","154":"Zac","157":"Yasuo","161":"Velkoz","163":"Taliyah","201":"Braum","202":"Jhin","203":"Kindred","222":"Jinx","223":"TahmKench","236":"Lucian",
"238":"Zed","245":"Ekko","254":"Vi","266":"Aatrox","267":"Nami","268":"Azir","412":"Thresh","420":"Illaoi","421":"RekSai","429":"Kalista","432":"Bard"};



    var statsSummary = {};

    var iteratorCounter = 0;

    var maxIterations = collectionSummary["summonerIds"].length;


//=========== Begin collection summary caller ============//

    collectionSummary["summonerIds"].forEach(function(sumId) {

      reqStatAccumulator(sumId, function(err, champArr) {

      // need to check if this is our last iteration, this will make sure we only return 
      // after parsing every summoner id
      if (iteratorCounter === maxIterations) {
        // this check is necessary if it's the last iteration but no data to accumulate
        // it will prevent errors by not parsing data that doesn't exist
        if (err) {
          collectionSummary["statsSummary"] = statsSummary
          return deferred.resolve(collectionSummary)
        }

        // code here will ensure our data accumulates before resolving our promise


      }

      // this last error check will just skip this iteration in the foreach loop
      // if there was an error requesting stats for the summoner
      if (err) return false;


      // if no errors exist and iteration counter is not finished:
      champArr.forEach(function(champ) {

        // ensure we don't accumulate an object's properties that don't exist
        if (statsSummary[champ["name"]] === undefined) {

          statsSummary[champ["name"]] = {}

          statsSummary[champ["name"]]["kills"] = champ["kills"]
          statsSummary[champ["name"]]["assists"] = champ["assists"]
          statsSummary[champ["name"]]["deaths"] = champ["deaths"]
          statsSummary[champ["name"]]["gamesPlayed"] = champ["gamesPlayed"]
          statsSummary[champ["name"]]["wins"] = champ["wins"]
          statsSummary[champ["name"]]["losses"] = champ["losses"]

          return 1

        }

        // accumulate stats if the champion exists, so no data is overwritten
        statsSummary[champ["name"]]["kills"] += champ["kills"]
        statsSummary[champ["name"]]["assists"] += champ["assists"]
        statsSummary[champ["name"]]["deaths"] += champ["deaths"]
        statsSummary[champ["name"]]["gamesPlayed"] += champ["gamesPlayed"]
        statsSummary[champ["name"]]["wins"] += champ["wins"]
        statsSummary[champ["name"]]["losses"] += champ["losses"]


      })


     })

    })


//=========== End Collection Summary Caller ================//


    function reqStatAccumulator(sumid, callback) {
      request("https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/" + sumId + "/ranked?season=SEASON2017&" + apiKey, function(error, response, body) {

        if (err || response.statusCode !== 200) return callback(err);

        var data = JSON.parse(body)

        var champDataArr = data["champions"].map(function(champInfo) {
          var champObj = {};

          champObj["name"] = champAssociations[champInfo["id"]];
          champObj["kills"] = Number(champInfo["stats"]["totalChampionKills"])
          champObj["deaths"] = Number(champInfo["stats"]["totalDeathsPerSession"])
          champObj["assists"] = Number(champInfo["stats"]["totalAssists"])
          champObj["gamesPlayed"] = Number(champInfo["stats"]["totalSessionsPlayed"])
          champObj["wins"] = Number(champInfo["stats"]["totalSessionsWon"])
          champObj["losses"] = Number(champInfo["stats"]["totalSessionsLost"])

          iteratorCounter++

          return callback(null, champObj)

        })

        return callback(null, champDataArr)

      })
    }


    /*// reqStatAccumulator function will be mapped to each summoner id in the collection
    // passed to this object's getSummaryCollection method, this will accumulate the 
    // stats of all champions in the statsSummary object
    function reqStatAccumulator(sumId) {

      request("https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/" + sumId + "/ranked?season=SEASON2017&" + apiKey, function(error, response, body) {

        if (error || response.statusCode != 200) {

            collectionSummary["statsSummary"] = statsSummary
            deferred.resolve(collectionSummary)
            return

        }

        var data = JSON.parse(body)


        for(var i = 0; i < data["champions"].length; ++i) {

          var indexRef = data["champions"][i]

          var champName = champAssociations[data["champions"][i]["id"]];

          if (statsSummary[champName] == undefined) {

            statsSummary[champName] = {}

            // set stats equal to the property I wish to take from data
            statsSummary[champName]["kills"] = Number(indexRef["stats"]["totalChampionKills"])
            statsSummary[champName]["deaths"] = Number(indexRef["stats"]["totalDeathsPerSession"])
            statsSummary[champName]["assists"] = Number(indexRef["stats"]["totalAssists"])
            statsSummary[champName]["gamesPlayed"] = Number(indexRef["stats"]["totalSessionsPlayed"])
            statsSummary[champName]["wins"] = Number(indexRef["stats"]["totalSessionsWon"])
            statsSummary[champName]["losses"] = Number(indexRef["stats"]["totalSessionsLost"])

            if(i === data["champions"].length){

              collectionSummary["statsSummary"] = statsSummary
              deferred.resolve(collectionSummary)

            } 

          }

          else {

            // increment the stats here
            statsSummary[champName]["kills"] += indexRef["stats"]["totalChampionKills"]
            statsSummary[champName]["deaths"] += indexRef["stats"]["totalDeathsPerSession"]
            statsSummary[champName]["assists"] += indexRef["stats"]["totalAssists"]
            statsSummary[champName]["gamesPlayed"] += indexRef["stats"]["totalSessionsPlayed"]
            statsSummary[champName]["wins"] += indexRef["stats"]["totalSessionsWon"]
            statsSummary[champName]["losses"] += indexRef["stats"]["totalSessionsLost"]

            if(i === data["champions"].length) {

              collectionSummary["statsSummary"] = statsSummary
              deferred.resolve(collectionSummary)

            } 

          }

        }

      })

    }*/

    return deferred.promise
  }

};

module.exports = apiCalls;
