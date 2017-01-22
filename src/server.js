var express = require("express");
var app = express();
var path = require("path");
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var mongoURL = require("./config")["mongoURL"];

var mainRoutes = require("./routes/main");

var port = process.env.PORT || 7777;
mongoose.connect(mongoURL);

app.use(express.static(__dirname + "/static"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/views"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());

app.use(mainRoutes);

app.listen(port, "127.0.0.1", function(){
  console.log(`Now serving app on port: ${port}`);
});
