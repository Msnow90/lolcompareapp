"use strict";

var gulp = require("gulp");
var open = require("open");
var browserify = require("browserify"); // bundles the JS
// may need to swap from reactify to babelify
var reactify = require("reactify"); // Transforms React JSX to JS
var source = require("vinyl-source-stream"); // allows use of conventional text streams with gulp
var concat = require("gulp-concat"); // concats glob of files into one file specified
var lint = require("gulp-eslint"); // lint our js and jsx files
var LiveServer = require("gulp-live-server"); //serve our own server
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-clean-css");


// can create various file paths for .js or css to separate bundles
var config  = {
  devBaseUrl: "http://localhost",
  paths: {
    lintPath: "./src/**/*.js",
    "routes": "./src/routes/**/*.js",
    "models": "./src/models/*.js",
    "middleware": "./src/middleware/*.js",
    "serverScripts": "./src/server-scripts/**/*.js",
    views: "./src/views/*",
    js: "./src/static/js/*.js",
    imgs: "./src/static/images/*",
    css:"./src/static/css/*.css",
    dist: "./dist",
    mainJS: "./src/static/js/main.js",
    config: "./src/config.js",
    "server": "./src/server.js"
  }
};

// Start a local dev server
gulp.task("connect", function () {
  var server = new LiveServer("./dist/server.js");
  setTimeout(function(){
    server.start();
    open("http://localhost:" + 7777);
  },4000);
  gulp.watch(config.paths.lintPath, function() {
    console.log("Server reloading...");
    server.start();
  })
})

gulp.task("views", function() {
  gulp.src(config.paths.views)
    .pipe(gulp.dest(config.paths.dist + "/views"));
})
// will bundle clientside js file, can run separate tasks for different bundles
// the bundle will also import any dependencies in that JS file into itself,
// thus limiting the amount of get requests for an asset
gulp.task("mainJS", function() {
  // passes in main react file, which enables browserify to import dependencies
  // of this file into the bundle
  browserify(config.paths.mainJS)
    .bundle()
    .on("error", console.error.bind(console))
    .pipe(source("mainBundle.js"))
    // can reference this by embedding script tag with src of mainReactBundle.js
    .pipe(gulp.dest(config.paths.dist + "/static/js"));
})

gulp.task("server", function() {
  gulp.src(config.paths.server)
    .pipe(gulp.dest(config.paths.dist));
})

gulp.task("routes", function() {
  gulp.src(config.paths.routes)
    .pipe(gulp.dest(config.paths.dist + "/routes"));
})

gulp.task("models", function() {
  gulp.src(config.paths.models)
    .pipe(gulp.dest(config.paths.dist + "/models"));
})

gulp.task("middleware", function() {
  gulp.src(config.paths.middleware)
    .pipe(gulp.dest(config.paths.dist + "/middleware"));
})

gulp.task("serverScripts", function() {
  gulp.src(config.paths.serverScripts)
    .pipe(gulp.dest(config.paths.dist + "/server-scripts"));
})

gulp.task("js", function() {
  gulp.src(config.paths.js)
    .pipe(gulp.dest(config.paths.dist + "/static/js"));
})

gulp.task("config", function() {
  gulp.src(config.paths.config)
    .pipe(gulp.dest(config.paths.dist));
})

gulp.task("css", function() {
  // css minified in views task
  gulp.src(config.paths.css)
    .pipe(concat("allStyles.css"))
    .pipe(minifyCss())
    .pipe(gulp.dest(config.paths.dist + "/static/css"))
})

gulp.task("imgs", function() {
  gulp.src(config.paths.imgs)
    .pipe(gulp.dest(config.paths.dist + "/static/images"));
})

gulp.task("lint", function () {
  // important to return results, since we need to see the output of linting
  return gulp.src(config.paths.lintPath)
    .pipe(lint())
    .pipe(lint.format());
})

gulp.task("watch", function () {
  // watches html files, loads html task is the files are changed
  gulp.watch(config.paths.views, ["views"]);
  // JS files will run js and lint task again
  //gulp.watch(config.paths.js, ["js", "lint"]);
  gulp.watch(config.paths.css, ["css"]);
  gulp.watch(config.paths.lintPath, ["mainJS", "routes", "models", "middleware", "serverScripts", "lint"]);
})

// with gulp default as task name - just running gulp in cmd line will run
gulp.task("default", ["views", "routes", "models", "middleware", "serverScripts", "mainJS", "config", "server", "js", "css", "imgs", "lint", "connect", "watch"]);
