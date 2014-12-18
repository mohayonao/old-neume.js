"use strict";

var util = require("../util");
var neume = require("../namespace");
var Emitter = require("../util/emitter");

var STATE_INIT = 0;
var STATE_START = 1;
var STATE_RUNNING = 2;
// var STATE_STOP = 3;
var STATE_DONE = 4;

function NeuSched(context, schedIter, callback) {
  Emitter.call(this);

  this.$context = context;

  this._schedIter = schedIter;
  this._state = STATE_INIT;
  this._count = 0;

  Object.defineProperties(this, {
    context: {
      value: this.$context,
      enumerable: true
    },
    state: {
      get: function() {
        return [
          "UNSCHEDULED",
          "SCHEDULED",
          "PLAYING",
          "PLAYING",
          "FINISHED"
        ][this._state];
      },
      enumerable: true
    },
  });

  if (typeof callback === "function") {
    this.on("sched", callback);
  }
}
util.inherits(NeuSched, Emitter);

NeuSched.$name = "NeuSched";

NeuSched.prototype.start = function(startTime) {
  if (this._state !== STATE_INIT) {
    return this;
  }

  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = STATE_START;

  context.sched(startTime, function(t0) {
    this.emit("start", { type: "start", playbackTime: t0 });
    this._state = STATE_RUNNING;
    sched(this, t0);
  }, this);

  context.start(); // auto start

  return this;
};

NeuSched.prototype.stop = function(startTime) {
  if (this._state !== STATE_RUNNING && this._state !== STATE_START) {
    return this;
  }

  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  context.sched(startTime, function(t0) {
    this.emit("stop", { type: "stop", playbackTime: t0 });
    this._state = STATE_DONE;
  }, this);

  return this;
};

function sched(_this, t0) {
  var context = _this.$context;

  var result = _this._schedIter.next();
  var t1 = t0 + util.finite(context.toSeconds(result.value));

  context.sched(t1, function(t0) {
    if (this._state !== STATE_RUNNING) {
      return;
    }
    this.emit("sched", {
      type: "sched",
      playbackTime: t0,
      count: this._count++,
      done: result.done
    });
    if (result.done) {
      this._state = STATE_DONE;
    } else {
      sched(this, t0);
    }
  }, _this);
}

module.exports = neume.Sched = NeuSched;
