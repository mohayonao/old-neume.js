"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var jshint = require("gulp-jshint");
var jscs = require("gulp-jscs");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");

gulp.task("lint", function() {
  return gulp.src([ "gulpfile.js", "src/**/*.js", "test/**/*.js", "plugins/**/*.js" ])
    .pipe(jshint())
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter("fail"));
});

gulp.task("jscs", function() {
  return gulp.src([ "gulpfile.js", "src/**/*.js", "test/**/*.js", "plugins/**/*.js" ])
    .pipe(jscs());
});

gulp.task("test", function() {
  require("./test/bootstrap/bootstrap.js");
  require("espower-loader")({
    cwd: process.cwd(),
    pattern: "test/**/*.js"
  });
  return gulp.src("test/**/*.js")
    .pipe(mocha());
});

gulp.task("cover", function(cb) {
  require("./test/bootstrap/bootstrap.js");
  gulp.src("src/**/*.js")
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on("finish", function() {
      return gulp.src("test/**/*.js")
        .pipe(mocha())
        .pipe(istanbul.writeReports("coverage"))
        .on("end", cb);
    });
});

gulp.task("build", function() {
  return browserify("./index.js")
    .bundle()
    /* neume.js */
    .pipe(source("neume.js"))
    .pipe(gulp.dest("build"))
    /* neume.min.js */
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename("neume.min.js"))
    .pipe(gulp.dest("build"))
    // neume.min.js.map
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("build"));
});

gulp.task("code", [ "lint", "jscs" ]);
gulp.task("travis", [ "code", "cover" ]);
gulp.task("default", [ "code", "cover", "build" ]);
