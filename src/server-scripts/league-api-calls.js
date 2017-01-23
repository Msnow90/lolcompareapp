var Q = require("q");
var request = require("request");


var apiCalls = function() {

  // retrieve the summoner id attached (searching by name)
  var getSummonerId = function(summonerName, apiKey) {

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
  }

  // queueType submitted from user to determine which data to pull
  var getLeagueIdCollection = function(summonerId, apiKey, queueType) {
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
  }

  var getSummaryCollection = function(collectionSummary, apiKey) {

    var deferred = Q.defer()


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

var reqCounter = 0
var sumIds = collectionSummary["summonerIds"]
console.log(`Length of array is : ${sumIds.length}`)
var statsSummary = {}

var reqInterval = setInterval(function() {

    // need to check if reqCounter is past any summoners, putting check here saves computation
    if (reqCounter >= sumIds.length || reqCounter >= 40) {
      clearInterval(reqInterval)
      collectionSummary["statsSummary"] = statsSummary
      deferred.resolve(collectionSummary)
    }

  request("https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/" + sumIds[reqCounter] + "/ranked?season=SEASON2017&" + apiKey, function(error, response, body) {

    // increment on every successful request sent, this will help with dead summoner ids
    reqCounter++
    console.log(`A request was sent request counter at: ${reqCounter}`)

    
    if (error || response.statusCode !== 200) {
      collectionSummary["statsSummary"] = statsSummary
      clearInterval(reqInterval)
      deferred.resolve(collectionSummary)
    }


    var data = JSON.parse(body)


    for(var i = 0; i < data["champions"].length; ++i) {

      var indexRef = data["champions"][i]

      var champName = champAssociations[data["champions"][i]["id"]];


      if (statsSummary[champName] == undefined) {

        statsSummary[champName] = {}

        // set stats equal to the property I wish to take from data
        statsSummary[champName]["kills"] = indexRef["stats"]["totalChampionKills"]
        statsSummary[champName]["deaths"] = indexRef["stats"]["totalDeathsPerSession"]
        statsSummary[champName]["assists"] = indexRef["stats"]["totalAssists"]
        statsSummary[champName]["gamesPlayed"] = indexRef["stats"]["totalSessionsPlayed"]
        statsSummary[champName]["wins"] = indexRef["stats"]["totalSessionsWon"]
        statsSummary[champName]["losses"] = indexRef["stats"]["totalSessionsLost"]
        console.log(`A champ was added`)

      }

      else {
       // increment the stats here
        statsSummary[champName]["kills"] += indexRef["stats"]["totalChampionKills"]
        statsSummary[champName]["deaths"] += indexRef["stats"]["totalDeathsPerSession"]
        statsSummary[champName]["assists"] += indexRef["stats"]["totalAssists"]
        statsSummary[champName]["gamesPlayed"] += indexRef["stats"]["totalSessionsPlayed"]
        statsSummary[champName]["wins"] += indexRef["stats"]["totalSessionsWon"]
        statsSummary[champName]["losses"] += indexRef["stats"]["totalSessionsLost"]
        console.log(`A champ was incremented`)
      }

    }

  })},1500);

    return deferred.promise
  }

  return {
    getSummonerId: getSummonerId,
    getLeagueIdCollection: getLeagueIdCollection,
    getSummaryCollection: getSummaryCollection
  }

};

module.exports = apiCalls();
