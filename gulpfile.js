"use strict";

var gulp = require("gulp");
var jshint    = require("gulp-jshint");
var mocha     = require("gulp-mocha");
var istanbul  = require("gulp-istanbul");
var browerify = require("gulp-browserify");
var uglify    = require("gulp-uglify");
var rename    = require("gulp-rename");

gulp.task("lint", function() {
  return gulp.src([ "gulpfile.js", "src/**/*.js" ])
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter("fail"));
});

gulp.task("test", function() {
  return gulp.src("test/**/*.js")
    .pipe(mocha());
});

gulp.task("cover", function(cb) {
  gulp.src("src/**/*.js")
    .pipe(istanbul())
    .on("finish", function() {
      return gulp.src("test/**/*.js")
        .pipe(mocha())
        .pipe(istanbul.writeReports("coverage"))
        .on("end", cb);
    });
});

gulp.task("build", function() {
  return gulp.src("index.js")
    /* neuma.js */
    .pipe(browerify())
    .pipe(rename("neuma.js"))
    .pipe(gulp.dest("build"))
    /* neuma.min.js */
    .pipe(uglify())
    .pipe(rename("neuma.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("travis", [ "lint", "cover" ]);
gulp.task("default", [ "lint", "cover", "build" ]);
